"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import {
  Upload, Download, Type, Highlighter, PenLine,
  Minus, Square, Circle, ChevronRight, ChevronLeft,
  ZoomIn, ZoomOut, X, Trash2, MousePointer, Eraser,
  Image as ImageIcon
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Tool = "select" | "text" | "draw" | "highlight" | "rect" | "circle" | "line" | "erase" | "image";

const CANVAS_W = 680;
const CANVAS_H = 960;

const COLORS = ["#F59E0B","#EF4444","#3B82F6","#10B981","#8B5CF6","#EC4899","#FFFFFF","#000000","#FDD835","#FF6B35"];

const TOOLS: { id: Tool; icon: React.ReactNode; label: string }[] = [
  { id:"select",    icon:<MousePointer className="w-4 h-4"/>, label:"تحديد" },
  { id:"text",      icon:<Type className="w-4 h-4"/>,         label:"نص" },
  { id:"highlight", icon:<Highlighter className="w-4 h-4"/>,  label:"تمييز" },
  { id:"draw",      icon:<PenLine className="w-4 h-4"/>,      label:"قلم" },
  { id:"rect",      icon:<Square className="w-4 h-4"/>,       label:"مستطيل" },
  { id:"circle",    icon:<Circle className="w-4 h-4"/>,       label:"دائرة" },
  { id:"line",      icon:<Minus className="w-4 h-4"/>,        label:"خط" },
  { id:"erase",     icon:<Eraser className="w-4 h-4"/>,       label:"حذف" },
];

function hexAlpha(hex: string, a: number) {
  const c = hex.replace("#","");
  return `rgba(${parseInt(c.slice(0,2),16)},${parseInt(c.slice(2,4),16)},${parseInt(c.slice(4,6),16)},${a})`;
}

export default function EditorPage() {
  const canvasRef    = useRef<HTMLCanvasElement>(null);
  const fabricRef    = useRef<{canvas:any; fabric:any}|null>(null);
  const pdfDocRef    = useRef<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imgInputRef  = useRef<HTMLInputElement>(null);
  const pageDataRef  = useRef<Record<number,any>>({});
  const shapeRef     = useRef<{start:{x:number;y:number}|null; obj:any}>({start:null,obj:null});
  const isDownRef    = useRef(false);
  const pendingRender= useRef(false);

  const [file,        setFile]        = useState<File|null>(null);
  const [numPages,    setNumPages]    = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [activeTool,  setActiveTool]  = useState<Tool>("select");
  const [color,       setColor]       = useState("#F59E0B");
  const [fontSize,    setFontSize]    = useState(22);
  const [lineWidth,   setLineWidth]   = useState(3);
  const [zoom,        setZoom]        = useState(1);
  const [loaded,      setLoaded]      = useState(false);
  const [rendering,   setRendering]   = useState(false);

  /* ── init Fabric.js once the canvas element is mounted ──
     The <canvas> only renders after a file is chosen, so initialise lazily
     when it actually appears in the DOM. A zero-size / missing canvas at
     init time would leave the interaction layer broken and the page blank. */
  useEffect(()=>{
    if(!file){
      // The <canvas> unmounts while no file is open, so drop the stale Fabric
      // instance — the next file binds to a freshly mounted canvas element.
      if(fabricRef.current){ try{fabricRef.current.canvas.dispose();}catch{} fabricRef.current=null; setLoaded(false); }
      return;
    }
    if(fabricRef.current){ setLoaded(true); return; }
    let alive=true; let raf=0;
    const tryInit=()=>{
      if(!alive) return;
      if(!canvasRef.current){ raf=requestAnimationFrame(tryInit); return; }
      import("fabric").then(mod=>{
        if(!alive||!canvasRef.current||fabricRef.current)return;
        const fabric=(mod as any).fabric??(mod as any).default??mod;
        const canvas=new fabric.Canvas(canvasRef.current,{
          width:CANVAS_W, height:CANVAS_H,
          backgroundColor:"#FFFFFF",
          selection:true, preserveObjectStacking:true,
        });
        fabricRef.current={canvas,fabric};
        canvas.calcOffset();
        setLoaded(true); // the render effect below paints page 1 once ready
      });
    };
    tryInit();
    return ()=>{ alive=false; cancelAnimationFrame(raf); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  },[file]);

  /* ── paint page 1 once BOTH Fabric is ready and the document is loaded ──
     Driven by state (loaded / numPages) so it fires no matter which of the
     two async steps (Fabric import vs. PDF parse) finishes last. */
  useEffect(()=>{
    if(loaded && pendingRender.current && pdfDocRef.current){
      pendingRender.current=false;
      renderPage(1,false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  },[loaded,numPages]);

  /* keep the interaction layer aligned when the page scrolls / resizes */
  useEffect(()=>{
    const onMove=()=>fabricRef.current?.canvas.calcOffset();
    window.addEventListener("resize",onMove);
    window.addEventListener("scroll",onMove,true);
    return ()=>{ window.removeEventListener("resize",onMove); window.removeEventListener("scroll",onMove,true); };
  },[]);

  /* ── rebind canvas tools when activeTool/color/lineWidth change ── */
  useEffect(()=>{
    const r=fabricRef.current; if(!r)return;
    const {canvas,fabric}=r;

    canvas.off("mouse:down");
    canvas.off("mouse:move");
    canvas.off("mouse:up");
    canvas.isDrawingMode=false;
    canvas.selection=(activeTool==="select");

    if(activeTool==="draw"){
      canvas.isDrawingMode=true;
      if(!canvas.freeDrawingBrush) canvas.freeDrawingBrush=new fabric.PencilBrush(canvas);
      canvas.freeDrawingBrush.color=color;
      canvas.freeDrawingBrush.width=lineWidth;
    } else if(activeTool==="highlight"){
      canvas.isDrawingMode=true;
      if(!canvas.freeDrawingBrush) canvas.freeDrawingBrush=new fabric.PencilBrush(canvas);
      canvas.freeDrawingBrush.color=hexAlpha(color,0.35);
      canvas.freeDrawingBrush.width=22;
    } else if(activeTool==="text"){
      canvas.on("mouse:down",(e:any)=>{
        if(e.target)return;
        const p=canvas.getPointer(e.e);
        const t=new fabric.IText("",{
          left:p.x, top:p.y,
          fontFamily:"Cairo,sans-serif", fontSize,
          fill:color, textAlign:"right", direction:"rtl",
          selectable:true, editable:true, hasControls:true,
          padding:4,
        });
        canvas.add(t);
        canvas.setActiveObject(t);
        t.enterEditing();
        canvas.renderAll();
      });
    } else if(activeTool==="rect"||activeTool==="circle"||activeTool==="line"){
      canvas.on("mouse:down",(e:any)=>{
        if(e.target)return;
        isDownRef.current=true;
        const p=canvas.getPointer(e.e);
        shapeRef.current.start=p;
        let obj:any;
        if(activeTool==="rect"){
          obj=new fabric.Rect({left:p.x,top:p.y,width:1,height:1,fill:"transparent",stroke:color,strokeWidth:lineWidth,selectable:true});
        } else if(activeTool==="circle"){
          obj=new fabric.Ellipse({left:p.x,top:p.y,rx:1,ry:1,fill:"transparent",stroke:color,strokeWidth:lineWidth,selectable:true});
        } else {
          obj=new fabric.Line([p.x,p.y,p.x,p.y],{stroke:color,strokeWidth:lineWidth,selectable:true});
        }
        shapeRef.current.obj=obj;
        canvas.add(obj);
      });
      canvas.on("mouse:move",(e:any)=>{
        if(!isDownRef.current||!shapeRef.current.start||!shapeRef.current.obj)return;
        const p=canvas.getPointer(e.e);
        const s=shapeRef.current.start;
        const obj=shapeRef.current.obj;
        if(activeTool==="rect"){
          obj.set({left:Math.min(p.x,s.x),top:Math.min(p.y,s.y),width:Math.abs(p.x-s.x),height:Math.abs(p.y-s.y)});
        } else if(activeTool==="circle"){
          const rx=Math.abs(p.x-s.x)/2, ry=Math.abs(p.y-s.y)/2;
          obj.set({left:Math.min(p.x,s.x),top:Math.min(p.y,s.y),rx,ry});
        } else {
          obj.set({x2:p.x,y2:p.y});
        }
        canvas.renderAll();
      });
      canvas.on("mouse:up",()=>{
        isDownRef.current=false;
        shapeRef.current={start:null,obj:null};
      });
    } else if(activeTool==="erase"){
      canvas.on("mouse:down",(e:any)=>{
        if(e.target){canvas.remove(e.target);canvas.renderAll();}
      });
    }
  },[activeTool,color,lineWidth,fontSize,loaded]);

  /* ── render PDF page to canvas background ── */
  const renderPage=useCallback(async(pageNum:number, saveCurrentFirst=true)=>{
    if(!pdfDocRef.current||!fabricRef.current)return;
    const {canvas,fabric}=fabricRef.current;
    if(saveCurrentFirst) pageDataRef.current[currentPage]=canvas.toJSON();
    setRendering(true);
    try{
      const pdfPage=await pdfDocRef.current.getPage(pageNum);
      const baseVp=pdfPage.getViewport({scale:1});
      const scale=CANVAS_W/baseVp.width;
      const viewport=pdfPage.getViewport({scale});
      const off=document.createElement("canvas");
      off.width=CANVAS_W; off.height=CANVAS_H;
      const ctx=off.getContext("2d")!;
      ctx.fillStyle="#FFFFFF"; ctx.fillRect(0,0,CANVAS_W,CANVAS_H);
      await pdfPage.render({canvasContext:ctx,viewport}).promise;
      const dataUrl=off.toDataURL("image/jpeg",0.92);
      await new Promise<void>(resolve=>{
        fabric.Image.fromURL(dataUrl,(img:any)=>{
          canvas.clear();
          canvas.setBackgroundImage(img,()=>{
            const saved=pageDataRef.current[pageNum];
            if(saved){
              canvas.loadFromJSON(saved,()=>{canvas.renderAll();resolve();});
            } else { canvas.renderAll(); resolve(); }
          },{scaleX:1,scaleY:CANVAS_H/img.height});
        });
      });
    }finally{setRendering(false);}
  },[currentPage]);

  /* ── load PDF file ── */
  const [loadError,setLoadError]=useState("");
  const handleFile=async(f:File)=>{
    if(f.type!=="application/pdf"&&!f.name.toLowerCase().endsWith(".pdf")){
      setLoadError("الرجاء اختيار ملف PDF صالح");
      return;
    }
    setLoadError("");
    pageDataRef.current={};
    pendingRender.current=true;   // request a page-1 paint as soon as ready
    setFile(f);                   // mounts the canvas (first file)
    try{
      const {loadPdfjs}=await import("@/lib/pdf");
      const pdfjs=await loadPdfjs();
      const ab=await f.arrayBuffer();
      const doc=await pdfjs.getDocument({data:new Uint8Array(ab)}).promise;
      pdfDocRef.current=doc;
      setCurrentPage(1);
      setNumPages(doc.numPages); // state change wakes the render effect
      if(fabricRef.current){
        // Fabric already initialised (e.g. opening a second file) → render now.
        pendingRender.current=false;
        await renderPage(1,false);
      }
    }catch(err:any){
      console.error("PDF load error:",err);
      setLoadError("تعذّر فتح الملف. تأكد أنه ملف PDF غير محمي بكلمة مرور.");
      pendingRender.current=false;
      setFile(null);
    }
  };

  const goToPage=async(p:number)=>{
    if(!pdfDocRef.current||p<1||p>numPages||rendering)return;
    await renderPage(p,true);
    setCurrentPage(p);
  };

  /* ── image upload ── */
  const addImage=(e:React.ChangeEvent<HTMLInputElement>)=>{
    const f=e.target.files?.[0]; if(!f||!fabricRef.current)return;
    const {canvas,fabric}=fabricRef.current;
    const url=URL.createObjectURL(f);
    fabric.Image.fromURL(url,(img:any)=>{
      img.scaleToWidth(200);
      img.set({left:50,top:50,selectable:true,hasControls:true});
      canvas.add(img); canvas.setActiveObject(img); canvas.renderAll();
    });
    e.target.value="";
  };

  /* ── export PDF ── */
  const exportPDF=async()=>{
    if(!pdfDocRef.current||!fabricRef.current||!file)return;
    const r=fabricRef.current;
    pageDataRef.current[currentPage]=r.canvas.toJSON();

    const {PDFDocument}=await import("pdf-lib");
    const newDoc=await PDFDocument.create();

    for(let p=1;p<=numPages;p++){
      const pdfPage=await pdfDocRef.current.getPage(p);
      const baseVp=pdfPage.getViewport({scale:1});
      const scale=CANVAS_W/baseVp.width;
      const viewport=pdfPage.getViewport({scale});
      const off=document.createElement("canvas");
      off.width=CANVAS_W; off.height=CANVAS_H;
      const ctx=off.getContext("2d")!;
      ctx.fillStyle="#FFFFFF"; ctx.fillRect(0,0,CANVAS_W,CANVAS_H);
      await pdfPage.render({canvasContext:ctx,viewport}).promise;

      const saved=pageDataRef.current[p];
      if(saved){
        const modImport=await import("fabric");
        const fab=(modImport as any).fabric??(modImport as any).default??modImport;
        const tmpEl=document.createElement("canvas");
        tmpEl.width=CANVAS_W; tmpEl.height=CANVAS_H;
        const fc=new fab.StaticCanvas(tmpEl,{width:CANVAS_W,height:CANVAS_H});
        await new Promise<void>(res=>{
          fc.loadFromJSON({...saved,background:""},()=>{ fc.renderAll(); res(); });
        });
        ctx.drawImage(tmpEl,0,0);
        try{ fc.dispose?.(); }catch{}
      }

      const imgData=off.toDataURL("image/png");
      const bytes=Uint8Array.from(atob(imgData.split(",")[1]),c=>c.charCodeAt(0));
      const embImg=await newDoc.embedPng(bytes);
      const page=newDoc.addPage([CANVAS_W,CANVAS_H]);
      page.drawImage(embImg,{x:0,y:0,width:CANVAS_W,height:CANVAS_H});
    }

    const pdfBytes=await newDoc.save();
    const blob=new Blob([pdfBytes.buffer as ArrayBuffer],{type:"application/pdf"});
    const a=document.createElement("a");
    a.href=URL.createObjectURL(blob);
    a.download=`معدّل-${file.name}`;
    a.click();
  };

  const clearPage=()=>{
    const r=fabricRef.current; if(!r)return;
    r.canvas.getObjects().slice().forEach((o:any)=>r.canvas.remove(o));
    r.canvas.renderAll();
  };

  return (
    <div className="flex flex-col gap-4" style={{minHeight:"calc(100vh - 120px)"}}>

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-4">
          <div className="w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0"
            style={{background:"linear-gradient(135deg,#8B5CF6,#EC4899)"}}>
            <PenLine className="w-5 h-5 text-white"/>
          </div>
          <div>
            <h1 className="text-xl font-800 text-slate-100">محرر PDF</h1>
            <p className="text-xs text-slate-500">ارسم • أضف نصوصاً • أشكال • صور على ملفاتك</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="glass" size="sm" onClick={()=>fileInputRef.current?.click()}>
            <Upload className="w-4 h-4"/>فتح ملف
          </Button>
          {file&&(
            <Button variant="gold" size="sm" onClick={exportPDF}>
              <Download className="w-4 h-4"/>تصدير PDF
            </Button>
          )}
        </div>
        <input ref={fileInputRef} type="file" className="hidden" accept="application/pdf"
          onChange={e=>e.target.files?.[0]&&handleFile(e.target.files[0])}/>
        <input ref={imgInputRef} type="file" className="hidden" accept="image/*" onChange={addImage}/>
      </div>

      {!file ? (
        <div className="upload-zone flex-1 flex items-center justify-center cursor-pointer"
          style={{minHeight:"60vh"}} onClick={()=>fileInputRef.current?.click()}>
          <div className="flex flex-col items-center gap-5">
            <div className="w-24 h-24 rounded-3xl flex items-center justify-center animate-float"
              style={{background:"rgba(139,92,246,0.1)",border:"2px dashed rgba(139,92,246,0.35)"}}>
              <Upload className="w-10 h-10" style={{color:"#8B5CF6"}}/>
            </div>
            <div className="text-center">
              <p className="text-xl font-700 text-slate-200 mb-1">ارفع ملف PDF للتحرير</p>
              <p className="text-sm text-slate-500">أضف نصوصاً • ارسم • أضف أشكالاً وصوراً</p>
              {loadError&&(
                <p className="text-sm text-red-400 mt-3 font-600">{loadError}</p>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="flex gap-3 flex-1">

          {/* ── Toolbar ── */}
          <div className="w-14 flex-shrink-0 flex flex-col gap-2">
            <div className="glass-card p-1.5 flex flex-col gap-1">
              {TOOLS.map(t=>(
                <button key={t.id} onClick={()=>setActiveTool(t.id)} title={t.label}
                  className={cn(
                    "w-11 h-11 rounded-xl flex flex-col items-center justify-center gap-0.5 transition-all text-[9px] font-600",
                    activeTool===t.id
                      ? "bg-gold-500/20 text-gold-400 border border-gold-500/40"
                      : "text-slate-500 hover:text-slate-200 hover:bg-white/5"
                  )}>
                  {t.icon}
                  <span className="leading-none">{t.label}</span>
                </button>
              ))}
              <div className="border-t border-white/8 pt-1 mt-1">
                <button onClick={()=>imgInputRef.current?.click()} title="صورة"
                  className="w-11 h-11 rounded-xl flex flex-col items-center justify-center gap-0.5 text-[9px] font-600 text-slate-500 hover:text-slate-200 hover:bg-white/5 transition-all">
                  <ImageIcon className="w-4 h-4"/>
                  <span className="leading-none">صورة</span>
                </button>
              </div>
            </div>

            <div className="glass-card p-2">
              <div className="grid grid-cols-2 gap-1 mb-2">
                {COLORS.map(c=>(
                  <button key={c} onClick={()=>setColor(c)}
                    className="w-5 h-5 rounded-md transition-all hover:scale-110"
                    style={{background:c,outline:color===c?"2px solid #F59E0B":"none",outlineOffset:"2px"}}/>
                ))}
              </div>
              <input type="color" value={color} onChange={e=>setColor(e.target.value)}
                className="w-full h-7 rounded-lg cursor-pointer bg-transparent border-0"/>
            </div>

            <div className="glass-card p-2 text-center">
              {activeTool==="text" ? (
                <>
                  <p className="text-[9px] text-slate-500 mb-1">حجم الخط</p>
                  <p className="text-sm font-700 text-gold-400 mb-1">{fontSize}</p>
                  <input type="range" min={8} max={96} value={fontSize}
                    onChange={e=>setFontSize(+e.target.value)} className="w-full"/>
                </>
              ) : (
                <>
                  <p className="text-[9px] text-slate-500 mb-1">السُمك</p>
                  <p className="text-sm font-700 text-gold-400 mb-1">{lineWidth}</p>
                  <input type="range" min={1} max={30} value={lineWidth}
                    onChange={e=>setLineWidth(+e.target.value)} className="w-full"/>
                </>
              )}
            </div>

            <div className="glass-card p-2 flex flex-col items-center gap-1">
              <button onClick={()=>setZoom(z=>Math.min(z+0.25,3))}
                className="w-10 h-9 rounded-xl flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/5">
                <ZoomIn className="w-4 h-4"/>
              </button>
              <span className="text-[10px] text-slate-600">{Math.round(zoom*100)}%</span>
              <button onClick={()=>setZoom(z=>Math.max(z-0.25,0.25))}
                className="w-10 h-9 rounded-xl flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/5">
                <ZoomOut className="w-4 h-4"/>
              </button>
            </div>
          </div>

          {/* ── Canvas area ── */}
          <div className="flex-1 glass-card overflow-hidden flex flex-col">
            <div className="flex items-center justify-between px-5 py-2.5 border-b border-white/6 flex-shrink-0">
              <span className="text-sm text-slate-400 truncate max-w-xs">{file.name}</span>
              <div className="flex items-center gap-2">
                <button onClick={()=>goToPage(currentPage-1)} disabled={currentPage<=1||rendering}
                  className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-slate-400 disabled:opacity-30">
                  <ChevronRight className="w-4 h-4"/>
                </button>
                <span className="text-sm text-slate-200 font-600 w-32 text-center">
                  {rendering ? (
                    <span className="flex items-center justify-center gap-1">
                      <span className="w-3 h-3 border border-gold-400 border-t-transparent rounded-full animate-spin"/>
                      تحميل...
                    </span>
                  ) : `صفحة ${currentPage} / ${numPages||"—"}`}
                </span>
                <button onClick={()=>goToPage(currentPage+1)} disabled={currentPage>=numPages||rendering}
                  className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-slate-400 disabled:opacity-30">
                  <ChevronLeft className="w-4 h-4"/>
                </button>
                <div className="w-px h-4 bg-white/10 mx-1"/>
                <button onClick={clearPage} title="مسح تعديلات هذه الصفحة"
                  className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-slate-500 hover:text-orange-400">
                  <Trash2 className="w-4 h-4"/>
                </button>
                <button onClick={()=>{
                    // The canvas element unmounts with the editor view, so fully
                    // dispose Fabric and reset state — the init effect re-creates
                    // it cleanly when the next file is opened.
                    try{ fabricRef.current?.canvas.dispose(); }catch{}
                    fabricRef.current=null;
                    pdfDocRef.current=null;
                    pageDataRef.current={};
                    pendingRender.current=false;
                    setLoaded(false);
                    setNumPages(0);
                    setCurrentPage(1);
                    setFile(null);
                  }}
                  className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-slate-500 hover:text-red-400">
                  <X className="w-4 h-4"/>
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-auto flex justify-center items-start p-6 bg-slate-950/30">
              <div style={{transform:`scale(${zoom})`,transformOrigin:"top center",transition:"transform 0.15s"}}>
                <div className="rounded-lg overflow-hidden shadow-2xl">
                  <canvas ref={canvasRef}/>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {file&&(
        <p className="text-center text-xs text-slate-700 pb-1">
          {activeTool==="select"&&"انقر على أي عنصر لتحديده • اسحب لتحريكه • زوايا التحجيم متاحة"}
          {activeTool==="text"&&"انقر على مكان فارغ في الملف لإضافة نص • انقر مزدوج لتعديل النص"}
          {activeTool==="draw"&&"اضغط واسحب للرسم الحر"}
          {activeTool==="highlight"&&"اضغط واسحب لتمييز منطقة"}
          {activeTool==="rect"&&"اضغط واسحب لرسم مستطيل"}
          {activeTool==="circle"&&"اضغط واسحب لرسم دائرة/بيضاوي"}
          {activeTool==="line"&&"اضغط واسحب لرسم خط"}
          {activeTool==="erase"&&"انقر على أي عنصر لحذفه"}
        </p>
      )}
    </div>
  );
}
