"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import {
  Palette, Type, Square, Circle, Minus,
  Image as ImageIcon, Download, Trash2, RotateCcw,
  ChevronUp, ChevronDown, Copy, Smile, Bold, Italic,
  Undo, Redo, ChevronsUp, ChevronsDown
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { addFile, bumpUsage } from "@/lib/store";
import { getDesignerSession, setDesignerSession } from "@/lib/session-store";

/* ─────────── helpers ─────────── */
function itext(f: any, text: string, opts: Record<string, any>) {
  return new f.IText(text, {
    selectable: true,
    evented: true,
    hasControls: true,
    hasBorders: true,
    lockUniScaling: false,
    ...opts,
  });
}

/* ─────────── template builders ─────────── */
function schoolReport(f: any, cv: any) {
  cv.clear(); cv.backgroundColor = "#1a237e";
  cv.add(
    new f.Rect({ left:0,top:0,width:420,height:14,fill:"#FDD835",selectable:false,evented:false }),
    new f.Rect({ left:0,top:580,width:420,height:14,fill:"#FDD835",selectable:false,evented:false }),
    new f.Rect({ left:0,top:14,width:420,height:110,fill:"rgba(255,255,255,0.06)",selectable:false,evented:false }),
    itext(f,"🎓",{left:210,top:69,fontSize:52,originX:"center",originY:"center",selectable:false,evented:false}),
    itext(f,"تقرير مدرسي",{left:210,top:185,fontSize:34,fontFamily:"Cairo,sans-serif",fill:"#FFFFFF",fontWeight:"bold",textAlign:"center",originX:"center",originY:"center"}),
    itext(f,"اسم الطالب",{left:210,top:240,fontSize:20,fontFamily:"Cairo,sans-serif",fill:"#FDD835",textAlign:"center",originX:"center",originY:"center"}),
    new f.Rect({left:80,top:272,width:260,height:2,fill:"#FDD835",rx:1,selectable:false,evented:false}),
    itext(f,"الصف / المرحلة الدراسية",{left:210,top:300,fontSize:16,fontFamily:"Cairo,sans-serif",fill:"rgba(255,255,255,0.6)",textAlign:"center",originX:"center",originY:"center"}),
    itext(f,"العام الدراسي ٢٠٢٤ / ٢٠٢٥",{left:210,top:340,fontSize:14,fontFamily:"Cairo,sans-serif",fill:"rgba(255,255,255,0.35)",textAlign:"center",originX:"center",originY:"center"}),
  );
  cv.renderAll();
}

function certificate(f: any, cv: any) {
  cv.clear(); cv.backgroundColor = "#4A148C";
  cv.add(
    new f.Rect({left:10,top:10,width:400,height:574,fill:"transparent",stroke:"#FFD700",strokeWidth:3,selectable:false,evented:false}),
    new f.Rect({left:18,top:18,width:384,height:558,fill:"transparent",stroke:"rgba(255,215,0,0.25)",strokeWidth:1,selectable:false,evented:false}),
    new f.Rect({left:0,top:0,width:420,height:85,fill:"rgba(255,215,0,0.08)",selectable:false,evented:false}),
    itext(f,"⭐",{left:55,top:42,fontSize:26,originX:"center",originY:"center",selectable:false,evented:false}),
    itext(f,"⭐",{left:365,top:42,fontSize:26,originX:"center",originY:"center",selectable:false,evented:false}),
    itext(f,"🏆",{left:210,top:48,fontSize:38,originX:"center",originY:"center",selectable:false,evented:false}),
    itext(f,"شهادة تقدير",{left:210,top:135,fontSize:38,fontFamily:"Cairo,sans-serif",fill:"#FFD700",fontWeight:"bold",textAlign:"center",originX:"center",originY:"center"}),
    itext(f,"تُمنح هذه الشهادة إلى",{left:210,top:205,fontSize:15,fontFamily:"Cairo,sans-serif",fill:"rgba(255,255,255,0.6)",textAlign:"center",originX:"center",originY:"center"}),
    itext(f,"اسم الطالب / الطالبة",{left:210,top:262,fontSize:30,fontFamily:"Cairo,sans-serif",fill:"#FFFFFF",fontWeight:"bold",textAlign:"center",originX:"center",originY:"center"}),
    itext(f,"تقديراً لتفوقه وتميزه الدراسي",{left:210,top:320,fontSize:15,fontFamily:"Cairo,sans-serif",fill:"rgba(255,255,255,0.6)",textAlign:"center",originX:"center",originY:"center"}),
    new f.Rect({left:120,top:430,width:180,height:1,fill:"#FFD700",selectable:false,evented:false}),
    itext(f,"توقيع مدير المدرسة",{left:210,top:450,fontSize:12,fontFamily:"Cairo,sans-serif",fill:"rgba(255,255,255,0.35)",textAlign:"center",originX:"center",originY:"center"}),
  );
  cv.renderAll();
}

function bookCover(f: any, cv: any) {
  cv.clear(); cv.backgroundColor = "#0D47A1";
  cv.add(
    new f.Rect({left:0,top:0,width:420,height:594,fill:"transparent",stroke:"rgba(255,255,255,0.1)",strokeWidth:20,selectable:false,evented:false}),
    new f.Rect({left:0,top:0,width:420,height:180,fill:"rgba(0,0,0,0.3)",selectable:false,evented:false}),
    new f.Rect({left:0,top:410,width:420,height:184,fill:"rgba(0,0,0,0.35)",selectable:false,evented:false}),
    itext(f,"📖",{left:210,top:90,fontSize:72,originX:"center",originY:"center",selectable:false,evented:false}),
    itext(f,"عنوان الكتاب",{left:210,top:290,fontSize:38,fontFamily:"Cairo,sans-serif",fill:"#FFFFFF",fontWeight:"bold",textAlign:"center",originX:"center",originY:"center"}),
    itext(f,"اسم المؤلف",{left:210,top:348,fontSize:20,fontFamily:"Cairo,sans-serif",fill:"rgba(255,255,255,0.7)",textAlign:"center",originX:"center",originY:"center"}),
    itext(f,"دار النشر • ٢٠٢٤",{left:210,top:480,fontSize:14,fontFamily:"Cairo,sans-serif",fill:"rgba(255,255,255,0.45)",textAlign:"center",originX:"center",originY:"center"}),
  );
  cv.renderAll();
}

function researchCover(f: any, cv: any) {
  cv.clear(); cv.backgroundColor = "#0F1923";
  cv.add(
    new f.Rect({left:0,top:0,width:420,height:8,fill:"#3B82F6",selectable:false,evented:false}),
    new f.Rect({left:0,top:8,width:420,height:160,fill:"rgba(59,130,246,0.08)",selectable:false,evented:false}),
    itext(f,"🔬",{left:210,top:88,fontSize:58,originX:"center",originY:"center",selectable:false,evented:false}),
    itext(f,"عنوان البحث العلمي",{left:210,top:220,fontSize:28,fontFamily:"Cairo,sans-serif",fill:"#FFFFFF",fontWeight:"bold",textAlign:"center",originX:"center",originY:"center"}),
    new f.Rect({left:30,top:256,width:360,height:1,fill:"rgba(59,130,246,0.3)",selectable:false,evented:false}),
    itext(f,"اسم الباحث",{left:210,top:290,fontSize:18,fontFamily:"Cairo,sans-serif",fill:"#3B82F6",textAlign:"center",originX:"center",originY:"center"}),
    itext(f,"وصف مختصر للبحث\nيمكن تعديله حسب الحاجة",{left:210,top:340,fontSize:14,fontFamily:"Cairo,sans-serif",fill:"rgba(255,255,255,0.4)",textAlign:"center",originX:"center",originY:"center",lineHeight:1.6}),
    itext(f,"اسم الجهة / المدرسة / الجامعة",{left:210,top:490,fontSize:13,fontFamily:"Cairo,sans-serif",fill:"rgba(255,255,255,0.3)",textAlign:"center",originX:"center",originY:"center"}),
    itext(f,"٢٠٢٤",{left:210,top:540,fontSize:12,fontFamily:"Cairo,sans-serif",fill:"rgba(59,130,246,0.5)",textAlign:"center",originX:"center",originY:"center"}),
  );
  cv.renderAll();
}

function homeworkSheet(f: any, cv: any) {
  cv.clear(); cv.backgroundColor = "#FAFAFA";
  cv.add(
    new f.Rect({left:0,top:0,width:420,height:80,fill:"#1565C0",selectable:false,evented:false}),
    itext(f,"✏️",{left:35,top:40,fontSize:30,originX:"center",originY:"center",selectable:false,evented:false}),
    itext(f,"ورقة واجب",{left:210,top:30,fontSize:26,fontFamily:"Cairo,sans-serif",fill:"#FFFFFF",fontWeight:"bold",textAlign:"center",originX:"center",originY:"center"}),
    itext(f,"اسم الطالب:",{left:30,top:110,fontSize:14,fontFamily:"Cairo,sans-serif",fill:"#1a237e",fontWeight:"bold"}),
    new f.Rect({left:30,top:132,width:260,height:1.5,fill:"#1565C0",selectable:false,evented:false}),
    itext(f,"الصف:",{left:30,top:158,fontSize:14,fontFamily:"Cairo,sans-serif",fill:"#1a237e",fontWeight:"bold"}),
    new f.Rect({left:30,top:178,width:140,height:1.5,fill:"#1565C0",selectable:false,evented:false}),
    itext(f,"التاريخ:",{left:220,top:158,fontSize:14,fontFamily:"Cairo,sans-serif",fill:"#1a237e",fontWeight:"bold"}),
    new f.Rect({left:220,top:178,width:130,height:1.5,fill:"#1565C0",selectable:false,evented:false}),
    itext(f,"الدرجة:",{left:310,top:110,fontSize:14,fontFamily:"Cairo,sans-serif",fill:"#1a237e",fontWeight:"bold"}),
    new f.Rect({left:310,top:132,width:80,height:1.5,fill:"#EF4444",selectable:false,evented:false}),
    new f.Rect({left:20,top:200,width:380,height:1,fill:"rgba(0,0,0,0.1)",selectable:false,evented:false}),
    itext(f,"اسم المادة / الموضوع",{left:210,top:225,fontSize:16,fontFamily:"Cairo,sans-serif",fill:"#1565C0",fontWeight:"bold",textAlign:"center",originX:"center",originY:"center"}),
    // Lined areas
    ...[250,285,320,355,390,425,460,495].map((y: number) =>
      new f.Rect({left:20,top:y,width:380,height:0.8,fill:"rgba(0,0,0,0.12)",selectable:false,evented:false})
    ),
  );
  cv.renderAll();
}

function studentCard(f: any, cv: any) {
  cv.clear(); cv.backgroundColor = "#0A1628";
  cv.add(
    new f.Rect({left:0,top:0,width:420,height:594,fill:"transparent",stroke:"rgba(245,158,11,0.4)",strokeWidth:2,selectable:false,evented:false}),
    new f.Rect({left:0,top:0,width:420,height:120,fill:"linear-gradient(180deg,#F59E0B,#D97706)",selectable:false,evented:false}),
    new f.Rect({left:0,top:0,width:420,height:120,fill:"#D97706",selectable:false,evented:false}),
    itext(f,"🪪",{left:210,top:52,fontSize:44,originX:"center",originY:"center",selectable:false,evented:false}),
    itext(f,"بطاقة الطالب",{left:210,top:100,fontSize:14,fontFamily:"Cairo,sans-serif",fill:"rgba(255,255,255,0.85)",textAlign:"center",originX:"center",originY:"center"}),
    // Photo placeholder
    new f.Rect({left:160,top:140,width:100,height:120,fill:"rgba(255,255,255,0.05)",stroke:"rgba(245,158,11,0.4)",strokeWidth:1.5,rx:8,ry:8,selectable:false,evented:false}),
    itext(f,"الصورة",{left:210,top:200,fontSize:12,fontFamily:"Cairo,sans-serif",fill:"rgba(255,255,255,0.2)",textAlign:"center",originX:"center",originY:"center"}),
    itext(f,"اسم الطالب",{left:210,top:290,fontSize:26,fontFamily:"Cairo,sans-serif",fill:"#F59E0B",fontWeight:"bold",textAlign:"center",originX:"center",originY:"center"}),
    new f.Rect({left:60,top:318,width:300,height:1,fill:"rgba(245,158,11,0.3)",selectable:false,evented:false}),
    itext(f,"الصف:",{left:90,top:345,fontSize:14,fontFamily:"Cairo,sans-serif",fill:"rgba(255,255,255,0.5)"}),
    itext(f,"الصف الأول الإعدادي",{left:200,top:345,fontSize:14,fontFamily:"Cairo,sans-serif",fill:"#FFFFFF",fontWeight:"bold",textAlign:"right"}),
    itext(f,"رقم الطالب:",{left:90,top:375,fontSize:14,fontFamily:"Cairo,sans-serif",fill:"rgba(255,255,255,0.5)"}),
    itext(f,"٢٠٢٤ / ٠٠١",{left:200,top:375,fontSize:14,fontFamily:"Cairo,sans-serif",fill:"#FFFFFF",fontWeight:"bold",textAlign:"right"}),
    itext(f,"اسم المدرسة",{left:210,top:470,fontSize:14,fontFamily:"Cairo,sans-serif",fill:"rgba(255,255,255,0.35)",textAlign:"center",originX:"center",originY:"center"}),
  );
  cv.renderAll();
}

function businessCover(f: any, cv: any) {
  cv.clear(); cv.backgroundColor = "#0D1B2A";
  cv.add(
    new f.Rect({left:0,top:0,width:8,height:594,fill:"#F59E0B",selectable:false,evented:false}),
    new f.Rect({left:0,top:0,width:420,height:594,fill:"rgba(59,130,246,0.04)",selectable:false,evented:false}),
    itext(f,"💼",{left:60,top:130,fontSize:60,originX:"center",originY:"center",selectable:false,evented:false}),
    itext(f,"عنوان الوثيقة",{left:240,top:220,fontSize:34,fontFamily:"Cairo,sans-serif",fill:"#FFFFFF",fontWeight:"bold"}),
    itext(f,"العنوان الفرعي أو نوع التقرير",{left:240,top:272,fontSize:16,fontFamily:"Cairo,sans-serif",fill:"rgba(255,255,255,0.4)"}),
    new f.Rect({left:30,top:320,width:360,height:1,fill:"rgba(245,158,11,0.25)",selectable:false,evented:false}),
    itext(f,"اسم المؤسسة",{left:240,top:345,fontSize:15,fontFamily:"Cairo,sans-serif",fill:"#F59E0B"}),
    itext(f,"٢٠٢٤",{left:30,top:540,fontSize:13,fontFamily:"Cairo,sans-serif",fill:"rgba(255,255,255,0.2)"}),
  );
  cv.renderAll();
}

function creativeCover(f: any, cv: any) {
  cv.clear(); cv.backgroundColor = "#150A2E";
  cv.add(
    new f.Circle({left:280,top:-80,radius:180,fill:"rgba(236,72,153,0.1)",selectable:false,evented:false}),
    new f.Circle({left:60,top:420,radius:150,fill:"rgba(139,92,246,0.1)",selectable:false,evented:false}),
    itext(f,"🎨",{left:210,top:130,fontSize:68,originX:"center",originY:"center",selectable:false,evented:false}),
    itext(f,"مشروع إبداعي",{left:210,top:242,fontSize:36,fontFamily:"Cairo,sans-serif",fill:"#FFFFFF",fontWeight:"bold",textAlign:"center",originX:"center",originY:"center"}),
    itext(f,"اسم المصمم / المبدع",{left:210,top:296,fontSize:16,fontFamily:"Cairo,sans-serif",fill:"#EC4899",textAlign:"center",originX:"center",originY:"center"}),
    new f.Rect({left:100,top:326,width:220,height:2,fill:"#EC4899",opacity:0.6,selectable:false,evented:false}),
  );
  cv.renderAll();
}

function minimalDark(f: any, cv: any) {
  cv.clear(); cv.backgroundColor = "#0A0A0A";
  cv.add(
    new f.Rect({left:0,top:248,width:4,height:98,fill:"#F59E0B",selectable:false,evented:false}),
    itext(f,"العنوان الرئيسي",{left:28,top:265,fontSize:36,fontFamily:"Cairo,sans-serif",fill:"#FFFFFF",fontWeight:"bold"}),
    itext(f,"العنوان الفرعي أو اسم المؤلف",{left:28,top:320,fontSize:16,fontFamily:"Cairo,sans-serif",fill:"rgba(255,255,255,0.32)"}),
    itext(f,"٢٠٢٤",{left:28,top:552,fontSize:13,fontFamily:"Cairo,sans-serif",fill:"rgba(255,255,255,0.18)"}),
  );
  cv.renderAll();
}

function gradientCover(f: any, cv: any) {
  cv.clear(); cv.backgroundColor = "#1a1a2e";
  [
    {y:0,h:100,c:"#e94560",o:0.8},{y:100,h:100,c:"#0f3460",o:0.9},
    {y:200,h:100,c:"#533483",o:0.85},{y:300,h:100,c:"#0f3460",o:0.9},
    {y:400,h:100,c:"#e94560",o:0.65},{y:500,h:94,c:"#533483",o:0.7},
  ].forEach(({y,h,c,o})=>cv.add(new f.Rect({left:0,top:y,width:420,height:h,fill:c,opacity:o,selectable:false,evented:false})));
  cv.add(
    itext(f,"عنوان مميز",{left:210,top:242,fontSize:44,fontFamily:"Cairo,sans-serif",fill:"#FFFFFF",fontWeight:"bold",textAlign:"center",originX:"center",originY:"center"}),
    itext(f,"العنوان الفرعي",{left:210,top:312,fontSize:22,fontFamily:"Cairo,sans-serif",fill:"rgba(255,255,255,0.8)",textAlign:"center",originX:"center",originY:"center"}),
  );
  cv.renderAll();
}

function timetable(f: any, cv: any) {
  cv.clear(); cv.backgroundColor = "#102A43";
  cv.add(
    new f.Rect({left:0,top:0,width:420,height:90,fill:"#1565C0",selectable:false,evented:false}),
    itext(f,"🗓️",{left:42,top:45,fontSize:32,originX:"center",originY:"center",selectable:false,evented:false}),
    itext(f,"جدول الحصص الأسبوعي",{left:225,top:36,fontSize:23,fontFamily:"Cairo,sans-serif",fill:"#FFFFFF",fontWeight:"bold",textAlign:"center",originX:"center",originY:"center"}),
    itext(f,"اسم الطالب / الفصل",{left:225,top:66,fontSize:13,fontFamily:"Cairo,sans-serif",fill:"rgba(255,255,255,0.7)",textAlign:"center",originX:"center",originY:"center"}),
  );
  ["الأحد","الإثنين","الثلاثاء","الأربعاء","الخميس"].forEach((d: string, i: number) => {
    const y = 120 + i * 88;
    cv.add(
      new f.Rect({left:20,top:y,width:380,height:74,fill:"rgba(255,255,255,0.05)",rx:10,ry:10,selectable:false,evented:false}),
      itext(f,d,{left:380,top:y+37,fontSize:16,fontFamily:"Cairo,sans-serif",fill:"#FDD835",fontWeight:"bold",textAlign:"right",originX:"right",originY:"center"}),
      itext(f,"............................................",{left:40,top:y+37,fontSize:13,fontFamily:"Cairo,sans-serif",fill:"rgba(255,255,255,0.28)",originY:"center"}),
    );
  });
  cv.renderAll();
}

function honorBoard(f: any, cv: any) {
  cv.clear(); cv.backgroundColor = "#14532D";
  cv.add(
    new f.Rect({left:12,top:12,width:396,height:570,fill:"transparent",stroke:"#FFD700",strokeWidth:3,selectable:false,evented:false}),
    itext(f,"🏆",{left:210,top:68,fontSize:54,originX:"center",originY:"center",selectable:false,evented:false}),
    itext(f,"لوحة الشرف",{left:210,top:150,fontSize:36,fontFamily:"Cairo,sans-serif",fill:"#FFD700",fontWeight:"bold",textAlign:"center",originX:"center",originY:"center"}),
    itext(f,"الطلاب المتفوقون لهذا الشهر",{left:210,top:198,fontSize:15,fontFamily:"Cairo,sans-serif",fill:"rgba(255,255,255,0.6)",textAlign:"center",originX:"center",originY:"center"}),
  );
  ["⭐","🥇","🥈","🥉","🌟"].forEach((medal: string, i: number) => {
    const y = 250 + i * 62;
    cv.add(
      new f.Rect({left:50,top:y,width:320,height:48,fill:"rgba(255,255,255,0.06)",rx:24,ry:24,selectable:false,evented:false}),
      itext(f,medal,{left:80,top:y+24,fontSize:20,originX:"center",originY:"center",selectable:false,evented:false}),
      itext(f,"اسم الطالب",{left:345,top:y+24,fontSize:16,fontFamily:"Cairo,sans-serif",fill:"#FFFFFF",fontWeight:"bold",textAlign:"right",originX:"right",originY:"center"}),
    );
  });
  cv.renderAll();
}

function notebookCover(f: any, cv: any) {
  cv.clear(); cv.backgroundColor = "#0D47A1";
  cv.add(
    new f.Rect({left:0,top:0,width:420,height:594,fill:"transparent",stroke:"rgba(255,255,255,0.12)",strokeWidth:16,selectable:false,evented:false}),
    itext(f,"📓",{left:210,top:95,fontSize:58,originX:"center",originY:"center",selectable:false,evented:false}),
    new f.Rect({left:50,top:175,width:320,height:305,fill:"#FFFFFF",rx:14,ry:14,selectable:false,evented:false}),
    itext(f,"كراسة المادة",{left:210,top:213,fontSize:24,fontFamily:"Cairo,sans-serif",fill:"#0D47A1",fontWeight:"bold",textAlign:"center",originX:"center",originY:"center"}),
    new f.Rect({left:90,top:246,width:240,height:2,fill:"#0D47A1",selectable:false,evented:false}),
    itext(f,"الاسم:",{left:330,top:288,fontSize:15,fontFamily:"Cairo,sans-serif",fill:"#37474F",fontWeight:"bold",textAlign:"right",originX:"right",originY:"center"}),
    new f.Rect({left:75,top:300,width:215,height:1.5,fill:"#90A4AE",selectable:false,evented:false}),
    itext(f,"الصف:",{left:330,top:338,fontSize:15,fontFamily:"Cairo,sans-serif",fill:"#37474F",fontWeight:"bold",textAlign:"right",originX:"right",originY:"center"}),
    new f.Rect({left:75,top:350,width:215,height:1.5,fill:"#90A4AE",selectable:false,evented:false}),
    itext(f,"المدرسة:",{left:330,top:388,fontSize:15,fontFamily:"Cairo,sans-serif",fill:"#37474F",fontWeight:"bold",textAlign:"right",originX:"right",originY:"center"}),
    new f.Rect({left:75,top:400,width:215,height:1.5,fill:"#90A4AE",selectable:false,evented:false}),
    itext(f,"العام الدراسي:",{left:330,top:438,fontSize:15,fontFamily:"Cairo,sans-serif",fill:"#37474F",fontWeight:"bold",textAlign:"right",originX:"right",originY:"center"}),
    new f.Rect({left:75,top:450,width:215,height:1.5,fill:"#90A4AE",selectable:false,evented:false}),
    itext(f,"اسم المدرسة • ٢٠٢٤ / ٢٠٢٥",{left:210,top:530,fontSize:13,fontFamily:"Cairo,sans-serif",fill:"rgba(255,255,255,0.5)",textAlign:"center",originX:"center",originY:"center"}),
  );
  cv.renderAll();
}

function schoolEvent(f: any, cv: any) {
  cv.clear(); cv.backgroundColor = "#311B92";
  cv.add(
    new f.Circle({left:-60,top:-60,radius:130,fill:"rgba(255,215,0,0.12)",selectable:false,evented:false}),
    new f.Circle({left:330,top:470,radius:150,fill:"rgba(236,72,153,0.14)",selectable:false,evented:false}),
    itext(f,"🎉",{left:210,top:95,fontSize:62,originX:"center",originY:"center",selectable:false,evented:false}),
    itext(f,"دعوة لحضور",{left:210,top:185,fontSize:16,fontFamily:"Cairo,sans-serif",fill:"rgba(255,255,255,0.6)",textAlign:"center",originX:"center",originY:"center"}),
    itext(f,"عنوان الفعالية",{left:210,top:235,fontSize:34,fontFamily:"Cairo,sans-serif",fill:"#FFD700",fontWeight:"bold",textAlign:"center",originX:"center",originY:"center"}),
    new f.Rect({left:110,top:280,width:200,height:2,fill:"#FFD700",selectable:false,evented:false}),
    itext(f,"📅  التاريخ: ........................",{left:210,top:345,fontSize:15,fontFamily:"Cairo,sans-serif",fill:"#FFFFFF",textAlign:"center",originX:"center",originY:"center"}),
    itext(f,"🕒  الوقت: ........................",{left:210,top:390,fontSize:15,fontFamily:"Cairo,sans-serif",fill:"#FFFFFF",textAlign:"center",originX:"center",originY:"center"}),
    itext(f,"📍  المكان: ........................",{left:210,top:435,fontSize:15,fontFamily:"Cairo,sans-serif",fill:"#FFFFFF",textAlign:"center",originX:"center",originY:"center"}),
    itext(f,"اسم المدرسة",{left:210,top:520,fontSize:14,fontFamily:"Cairo,sans-serif",fill:"rgba(255,255,255,0.4)",textAlign:"center",originX:"center",originY:"center"}),
  );
  cv.renderAll();
}

/* ─────────── frame builders ─────────── */
const W = 420, H = 594;

function clearFrames(cv: any) {
  cv.getObjects().filter((o: any) => o.isFrame).forEach((o: any) => cv.remove(o));
}
function frameObj(o: any) { o.set({ selectable: false, evented: false }); o.isFrame = true; return o; }

const FRAMES: { id: string; name: string; color: string; build: (f: any, cv: any, c: string) => void }[] = [
  { id: "none", name: "بلا إطار", color: "#94A3B8", build: (f, cv) => clearFrames(cv) },
  { id: "double", name: "مزدوج", color: "#FFD700", build: (f, cv, c) => {
      clearFrames(cv);
      cv.add(frameObj(new f.Rect({ left: 12, top: 12, width: W-24, height: H-24, fill: "transparent", stroke: c, strokeWidth: 3 })));
      cv.add(frameObj(new f.Rect({ left: 20, top: 20, width: W-40, height: H-40, fill: "transparent", stroke: c, strokeWidth: 1 })));
      cv.renderAll();
    } },
  { id: "thick", name: "سميك", color: "#F59E0B", build: (f, cv, c) => {
      clearFrames(cv);
      cv.add(frameObj(new f.Rect({ left: 0, top: 0, width: W, height: H, fill: "transparent", stroke: c, strokeWidth: 22 })));
      cv.renderAll();
    } },
  { id: "rounded", name: "دائري", color: "#3B82F6", build: (f, cv, c) => {
      clearFrames(cv);
      cv.add(frameObj(new f.Rect({ left: 16, top: 16, width: W-32, height: H-32, rx: 24, ry: 24, fill: "transparent", stroke: c, strokeWidth: 4 })));
      cv.renderAll();
    } },
  { id: "dashed", name: "متقطع", color: "#10B981", build: (f, cv, c) => {
      clearFrames(cv);
      cv.add(frameObj(new f.Rect({ left: 18, top: 18, width: W-36, height: H-36, fill: "transparent", stroke: c, strokeWidth: 3, strokeDashArray: [12, 8] })));
      cv.renderAll();
    } },
  { id: "corners", name: "زوايا", color: "#EC4899", build: (f, cv, c) => {
      clearFrames(cv);
      const L = 56, t = 5;
      const segs = [
        [18,18,18+L,18],[18,18,18,18+L],            // top-left
        [W-18-L,18,W-18,18],[W-18,18,W-18,18+L],     // top-right
        [18,H-18,18+L,H-18],[18,H-18-L,18,H-18],     // bottom-left
        [W-18-L,H-18,W-18,H-18],[W-18,H-18-L,W-18,H-18], // bottom-right
      ];
      segs.forEach(s => cv.add(frameObj(new f.Line(s, { stroke: c, strokeWidth: t }))));
      cv.renderAll();
    } },
  { id: "ribbon", name: "شريط علوي", color: "#FFD700", build: (f, cv, c) => {
      clearFrames(cv);
      cv.add(frameObj(new f.Rect({ left: 0, top: 0, width: W, height: 10, fill: c })));
      cv.add(frameObj(new f.Rect({ left: 0, top: H-10, width: W, height: 10, fill: c })));
      cv.renderAll();
    } },
];

/* school-themed vector graphics built with fabric paths/polygons */
function starPoints(cx: number, cy: number, outer: number, inner: number, spikes = 5) {
  const pts: { x: number; y: number }[] = [];
  let rot = -Math.PI / 2;
  const step = Math.PI / spikes;
  for (let i = 0; i < spikes; i++) {
    pts.push({ x: cx + Math.cos(rot) * outer, y: cy + Math.sin(rot) * outer }); rot += step;
    pts.push({ x: cx + Math.cos(rot) * inner, y: cy + Math.sin(rot) * inner }); rot += step;
  }
  return pts;
}

const GRAPHICS: { id: string; label: string; emoji: string; make: (f: any, color: string) => any }[] = [
  { id: "star", label: "نجمة", emoji: "⭐", make: (f, c) => new f.Polygon(starPoints(60, 60, 55, 24), { left: 150, top: 220, fill: c, opacity: 0.9 }) },
  { id: "badge", label: "وسام", emoji: "🏅", make: (f, c) => new f.Polygon(starPoints(60, 60, 58, 46, 12), { left: 150, top: 220, fill: c, opacity: 0.9 }) },
  { id: "heart", label: "قلب", emoji: "❤️", make: (f, c) => new f.Path("M 50 30 C 50 20 35 10 25 20 C 12 32 25 50 50 70 C 75 50 88 32 75 20 C 65 10 50 20 50 30 z", { left: 160, top: 230, fill: c, opacity: 0.9, scaleX: 1.3, scaleY: 1.3 }) },
  { id: "arrow", label: "سهم", emoji: "➡️", make: (f, c) => new f.Polygon([{x:0,y:20},{x:60,y:20},{x:60,y:0},{x:100,y:35},{x:60,y:70},{x:60,y:50},{x:0,y:50}], { left: 150, top: 260, fill: c, opacity: 0.9 }) },
  { id: "banner", label: "لافتة", emoji: "🚩", make: (f, c) => new f.Polygon([{x:0,y:0},{x:200,y:0},{x:200,y:50},{x:175,y:35},{x:150,y:50},{x:125,y:35},{x:100,y:50},{x:75,y:35},{x:50,y:50},{x:25,y:35},{x:0,y:50}], { left: 110, top: 250, fill: c, opacity: 0.9 }) },
  { id: "bubble", label: "فقاعة", emoji: "💬", make: (f, c) => new f.Path("M 10 10 L 190 10 Q 200 10 200 25 L 200 90 Q 200 105 190 105 L 60 105 L 35 130 L 40 105 L 10 105 Q 0 105 0 90 L 0 25 Q 0 10 10 10 z", { left: 110, top: 240, fill: c, opacity: 0.9 }) },
  { id: "burst", label: "وميض", emoji: "💥", make: (f, c) => new f.Polygon(starPoints(60, 60, 58, 30, 10), { left: 150, top: 220, fill: c, opacity: 0.9 }) },
  { id: "hex", label: "سداسي", emoji: "⬡", make: (f, c) => new f.Polygon([{x:50,y:0},{x:100,y:28},{x:100,y:82},{x:50,y:110},{x:0,y:82},{x:0,y:28}], { left: 160, top: 230, fill: c, opacity: 0.9 }) },
];

/* ─────────── registries ─────────── */
const TEMPLATES = [
  {id:"school-report",name:"تقرير مدرسي",cat:"مدرسي",emoji:"📚",build:schoolReport},
  {id:"certificate",  name:"شهادة تقدير", cat:"مدرسي",emoji:"🏆",build:certificate},
  {id:"book-cover",   name:"غلاف كتاب",   cat:"مدرسي",emoji:"📖",build:bookCover},
  {id:"research",     name:"غلاف بحث",    cat:"مدرسي",emoji:"🔬",build:researchCover},
  {id:"homework",     name:"ورقة واجب",   cat:"مدرسي",emoji:"✏️",build:homeworkSheet},
  {id:"student-card", name:"بطاقة طالب",  cat:"مدرسي",emoji:"🪪",build:studentCard},
  {id:"timetable",    name:"جدول الحصص",  cat:"مدرسي",emoji:"🗓️",build:timetable},
  {id:"honor-board",  name:"لوحة الشرف",  cat:"مدرسي",emoji:"🏆",build:honorBoard},
  {id:"notebook",     name:"غلاف كراسة",  cat:"مدرسي",emoji:"📓",build:notebookCover},
  {id:"school-event", name:"دعوة فعالية", cat:"مدرسي",emoji:"🎉",build:schoolEvent},
  {id:"business",     name:"أعمال",        cat:"عام",  emoji:"💼",build:businessCover},
  {id:"creative",     name:"إبداعي",       cat:"عام",  emoji:"🎨",build:creativeCover},
  {id:"minimal",      name:"داكن أنيق",   cat:"عام",  emoji:"🌙",build:minimalDark},
  {id:"gradient",     name:"تدرج ملوّن",  cat:"عام",  emoji:"🌈",build:gradientCover},
];

const STICKERS = [
  { group: "تحفيز", items: ["⭐","🌟","💯","🔥","✅","🎯","🏅","👑","🎖️","🥇"] },
  { group: "مدرسة", items: ["🎓","📚","✏️","📝","🖊️","📖","🔭","🔬","📐","📏"] },
  { group: "رياضيات", items: ["➕","➖","✖️","➗","∑","π","∞","📊","📈","🔢"] },
  { group: "تعبير",   items: ["❤️","💛","💙","💚","🌺","🌸","🌻","🦋","🌈","🕊️"] },
  { group: "أشكال",   items: ["◼️","⬛","🟡","🟢","🔵","🔴","⬜","🟠","🟣","🟤"] },
];

// Arabic display fonts loaded from Google Fonts (see font-loading effect below).
const FONTS = ["Cairo","Tajawal","Almarai","Amiri","Aref Ruqaa","Reem Kufi","El Messiri",
  "Lalezar","Changa","Markazi Text","Noto Kufi Arabic","IBM Plex Sans Arabic",
  "Readex Pro","Rakkas","Mada","Baloo Bhaijaan 2"];
const GOOGLE_FONTS_HREF =
  "https://fonts.googleapis.com/css2?" +
  ["Cairo:wght@400;700;900","Tajawal:wght@400;700","Almarai:wght@400;700;800",
   "Amiri:wght@400;700","Aref+Ruqaa:wght@400;700","Reem+Kufi:wght@400;700",
   "El+Messiri:wght@400;700","Lalezar","Changa:wght@400;700","Markazi+Text:wght@400;700",
   "Noto+Kufi+Arabic:wght@400;700","IBM+Plex+Sans+Arabic:wght@400;700",
   "Readex+Pro:wght@400;700","Rakkas","Mada:wght@400;700","Baloo+Bhaijaan+2:wght@400;700"]
    .map(f => `family=${f}`).join("&") + "&display=swap";

const CATS  = ["الكل","مدرسي","عام"];
const COLORS = ["#F59E0B","#EF4444","#3B82F6","#10B981","#8B5CF6","#EC4899","#FFFFFF","#000000","#FDD835","#1565C0"];
const BG_PRESETS = ["#060A14","#0A1628","#1a237e","#4A148C","#1B5E20","#0D47A1","#0F1923","#FAFAFA","#0A0A0A","#150A2E"];

type TabType = "templates" | "text" | "shapes" | "frames" | "stickers" | "bg";

export default function DesignerPage() {
  const canvasRef  = useRef<HTMLCanvasElement>(null);
  const fabricRef  = useRef<{canvas:any;fabric:any}|null>(null);
  const fileImgRef = useRef<HTMLInputElement>(null);
  const historyRef = useRef<{stack:string[]; index:number; locked:boolean}>({stack:[],index:-1,locked:false});
  const [canUndo,  setCanUndo]  = useState(false);
  const [canRedo,  setCanRedo]  = useState(false);
  const [opacity,  setOpacity]  = useState(100);
  const [hasSel,   setHasSel]   = useState(false);
  const [loaded,   setLoaded]   = useState(false);
  const [tab,      setTab]      = useState<TabType>("templates");
  const [cat,      setCat]      = useState("الكل");
  const [selTpl,   setSelTpl]   = useState<string|null>(null);
  const [txtVal,   setTxtVal]   = useState("اكتب هنا");
  const [fSize,    setFSize]    = useState(28);
  const [fontFam,  setFontFam]  = useState("Cairo");
  const [color,    setColor]    = useState("#F59E0B");
  const [bold,     setBold]     = useState(true);
  const [italic,   setItalic]   = useState(false);
  const [bgColor,  setBgColor]  = useState("#0A1628");
  const [hint,     setHint]     = useState(true);
  const [selFrame, setSelFrame] = useState("none");

  /* load Arabic display fonts so canvas text renders with the chosen font */
  useEffect(()=>{
    if(typeof document==="undefined")return;
    if(!document.getElementById("designer-fonts")){
      const link=document.createElement("link");
      link.id="designer-fonts"; link.rel="stylesheet"; link.href=GOOGLE_FONTS_HREF;
      document.head.appendChild(link);
    }
    (document as any).fonts?.ready?.then(()=>{
      fabricRef.current?.canvas.requestRenderAll();
    });
  },[]);

  useEffect(()=>{
    let alive=true;
    import("fabric").then(mod=>{
      if(!alive||!canvasRef.current||fabricRef.current)return;
      const fabric=(mod as any).fabric??(mod as any).default??mod;
      const canvas=new fabric.Canvas(canvasRef.current,{
        width:420, height:594, backgroundColor:"#0A1628",
        selection:true, preserveObjectStacking:true,
      });
      fabricRef.current={canvas,fabric};
      setLoaded(true);
      // Record history on every meaningful change (skipped while locked during
      // batch restores / template application).
      canvas.on("object:added",snapshot);
      canvas.on("object:modified",snapshot);
      canvas.on("object:removed",snapshot);
      // seed the initial (empty) state so the first undo has a target
      setTimeout(()=>{ historyRef.current.stack=[]; historyRef.current.index=-1; snapshot(); },200);
      // reflect the selected object's opacity in the slider + enable controls
      const onSelect=()=>{ const o=canvas.getActiveObject(); setHasSel(!!o); if(o) setOpacity(Math.round((o.opacity??1)*100)); };
      canvas.on("selection:created",onSelect);
      canvas.on("selection:updated",onSelect);
      canvas.on("selection:cleared",()=>setHasSel(false));
      // The canvas is now visible; recalc the interaction-layer geometry so
      // mouse selection/drag/double-click map to the correct coordinates.
      const recalc=()=>{ canvas.setDimensions({width:420,height:594}); canvas.calcOffset(); canvas.requestRenderAll(); };
      requestAnimationFrame(recalc);
      setTimeout(recalc,150);
      // Keep the offset correct when the page scrolls or the viewport resizes
      // (the canvas lives inside scrollable / responsive containers).
      const onMove=()=>canvas.calcOffset();
      window.addEventListener("resize",onMove);
      window.addEventListener("scroll",onMove,true);
      (canvas as any).__cleanupOffset=()=>{
        window.removeEventListener("resize",onMove);
        window.removeEventListener("scroll",onMove,true);
      };
      setTimeout(()=>setHint(false),6000);
    });
    return ()=>{
      alive=false;
      const c=fabricRef.current?.canvas as any;
      if(c?.__cleanupOffset)c.__cleanupOffset();
      // Save canvas state so it survives page navigation
      if(fabricRef.current?.canvas){
        try{ setDesignerSession({ canvasJson: fabricRef.current.canvas.toJSON() }); }catch{}
      }
    };
  },[]);

  /* ── Restore designer session after canvas is ready ─────────────────────
     This runs once when the canvas initialises (loaded flips to true).
     If the user had a previous design, we reload it from the session store. */
  useEffect(()=>{
    if(!loaded||!fabricRef.current)return;
    const s=getDesignerSession();
    if(s.canvasJson){
      historyRef.current.locked=true;
      fabricRef.current.canvas.loadFromJSON(s.canvasJson,()=>{
        fabricRef.current!.canvas.renderAll();
        historyRef.current.locked=false;
      });
    }
    if(s.bgColor)setBgColor(s.bgColor);
    if(s.tab)setTab(s.tab as any);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  },[loaded]);

  // Keep session updated with bgColor & tab as they change
  useEffect(()=>{ setDesignerSession({ bgColor, tab }); },[bgColor, tab]);

  /* keyboard: Delete/Backspace removes selected object (unless editing text) */
  useEffect(()=>{
    const onKey=(e:KeyboardEvent)=>{
      const r=fabricRef.current; if(!r)return;
      // Undo / Redo (Ctrl/Cmd+Z, Ctrl/Cmd+Shift+Z or Ctrl+Y)
      if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==="z"){
        e.preventDefault(); if(e.shiftKey) redo(); else undo(); return;
      }
      if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==="y"){ e.preventDefault(); redo(); return; }
      const obj=r.canvas.getActiveObject();
      if(!obj||obj.isEditing)return;
      if(e.key==="Delete"||e.key==="Backspace"){
        e.preventDefault(); r.canvas.remove(obj); r.canvas.discardActiveObject(); r.canvas.renderAll();
      }
    };
    window.addEventListener("keydown",onKey);
    return ()=>window.removeEventListener("keydown",onKey);
  },[]);

  /* ── undo / redo history ──
     Snapshots the whole canvas (objects + background) to a JSON stack. Batch
     operations (templates, frames) lock recording and snapshot once at the end
     so a single undo reverts the entire action — Canva-style. */
  const snapshot=()=>{
    const r=fabricRef.current; if(!r)return;
    const h=historyRef.current; if(h.locked)return;
    const json=JSON.stringify(r.canvas.toJSON(["isFrame"]));
    h.stack=h.stack.slice(0,h.index+1);
    h.stack.push(json);
    if(h.stack.length>60){ h.stack.shift(); } else { h.index++; }
    h.index=h.stack.length-1;
    setCanUndo(h.index>0); setCanRedo(false);
  };
  const restore=(json:string)=>{
    const r=fabricRef.current; if(!r)return;
    const h=historyRef.current; h.locked=true;
    r.canvas.loadFromJSON(json,()=>{
      r.canvas.renderAll();
      setBgColor((r.canvas.backgroundColor as string)||"#0A1628");
      h.locked=false;
    });
  };
  const undo=()=>{
    const h=historyRef.current; if(h.index<=0)return;
    h.index--; restore(h.stack[h.index]);
    setCanUndo(h.index>0); setCanRedo(true);
  };
  const redo=()=>{
    const h=historyRef.current; if(h.index>=h.stack.length-1)return;
    h.index++; restore(h.stack[h.index]);
    setCanRedo(h.index<h.stack.length-1); setCanUndo(true);
  };
  /* run a multi-object operation as one undo step */
  const batch=(fn:()=>void)=>{
    const h=historyRef.current; h.locked=true;
    fn();
    h.locked=false; snapshot();
  };

  const applyTemplate=(tpl:typeof TEMPLATES[0])=>{
    const r=fabricRef.current; if(!r)return;
    batch(()=>{
    tpl.build(r.fabric,r.canvas);
    // Unlock every element of the template so the user can move, resize,
    // recolor or delete ANY object (not just the text) — Canva-style. Frames
    // stay locked because they are decorative borders managed separately.
    r.canvas.getObjects().forEach((o:any)=>{
      if(o.isFrame)return;
      o.set({selectable:true,evented:true,hasControls:true,hasBorders:true});
      o.setCoords?.();
    });
    r.canvas.requestRenderAll();
    });
    setSelTpl(tpl.id);
    setSelFrame("none");
    setBgColor(r.canvas.backgroundColor as string);
    setHint(false);
  };

  const addText=()=>{
    const r=fabricRef.current; if(!r)return;
    const {canvas,fabric}=r;
    const t=new fabric.IText(txtVal||"نص جديد",{
      left:210, top:297,
      fontFamily:`${fontFam},sans-serif`,
      fontSize:fSize, fill:color,
      fontWeight:bold?"bold":"normal",
      fontStyle:italic?"italic":"normal",
      textAlign:"center", originX:"center", originY:"center",
      selectable:true, editable:true, hasControls:true,
    });
    canvas.add(t); canvas.setActiveObject(t); canvas.renderAll();
  };

  const addSticker=(emoji:string)=>{
    const r=fabricRef.current; if(!r)return;
    const {canvas,fabric}=r;
    const t=new fabric.IText(emoji,{
      left:210, top:297, fontSize:48,
      originX:"center", originY:"center",
      selectable:true, hasControls:true, editable:false,
    });
    canvas.add(t); canvas.setActiveObject(t); canvas.renderAll();
  };

  const addShape=(type:"rect"|"circle"|"triangle")=>{
    const r=fabricRef.current; if(!r)return;
    const {canvas,fabric}=r;
    let s:any;
    if(type==="rect")        s=new fabric.Rect({left:140,top:200,width:140,height:100,fill:color,opacity:0.8,rx:8,ry:8});
    else if(type==="circle") s=new fabric.Circle({left:155,top:200,radius:65,fill:color,opacity:0.8});
    else                     s=new fabric.Triangle({left:140,top:200,width:140,height:120,fill:color,opacity:0.8});
    canvas.add(s); canvas.setActiveObject(s); canvas.renderAll();
  };

  const addLine=()=>{
    const r=fabricRef.current; if(!r)return;
    const {canvas,fabric}=r;
    const l=new fabric.Line([40,297,380,297],{stroke:color,strokeWidth:3,selectable:true,hasControls:true});
    canvas.add(l); canvas.setActiveObject(l); canvas.renderAll();
  };

  const addGraphic=(g:typeof GRAPHICS[0])=>{
    const r=fabricRef.current; if(!r)return;
    const {canvas,fabric}=r;
    const obj=g.make(fabric,color);
    obj.set({selectable:true,hasControls:true});
    canvas.add(obj); canvas.setActiveObject(obj); canvas.renderAll();
  };

  const applyFrame=(fr:typeof FRAMES[0])=>{
    const r=fabricRef.current; if(!r)return;
    batch(()=>fr.build(r.fabric,r.canvas,color));
    setSelFrame(fr.id);
  };

  const changeBg=(c:string)=>{
    const r=fabricRef.current; if(!r)return;
    r.canvas.backgroundColor=c; r.canvas.renderAll(); setBgColor(c);
    snapshot();
  };

  /* opacity + alignment + layering for the selected object */
  const changeOpacity=(v:number)=>{
    const r=fabricRef.current; if(!r)return;
    setOpacity(v);
    const o=r.canvas.getActiveObject(); if(!o)return;
    o.set({opacity:v/100}); r.canvas.renderAll();
  };
  const alignCenter=(axis:"h"|"v")=>{
    const r=fabricRef.current; if(!r)return;
    const o=r.canvas.getActiveObject(); if(!o)return;
    if(axis==="h") o.centerH(); else o.centerV();
    o.setCoords(); r.canvas.renderAll(); snapshot();
  };
  const toFront=()=>{ const r=fabricRef.current; if(!r)return; const o=r.canvas.getActiveObject(); if(o){r.canvas.bringToFront(o);r.canvas.renderAll();snapshot();} };
  const toBack =()=>{ const r=fabricRef.current; if(!r)return; const o=r.canvas.getActiveObject(); if(o){r.canvas.sendToBack(o);r.canvas.renderAll();snapshot();} };

  const handleImg=(e:React.ChangeEvent<HTMLInputElement>)=>{
    const file=e.target.files?.[0]; if(!file||!fabricRef.current)return;
    const {canvas,fabric}=fabricRef.current;
    const url=URL.createObjectURL(file);
    fabric.Image.fromURL(url,(img:any)=>{
      img.scaleToWidth(200); img.set({left:110,top:197,selectable:true,hasControls:true});
      canvas.add(img); canvas.setActiveObject(img); canvas.renderAll();
    });
  };

  const fwd=()=>{ const r=fabricRef.current; if(!r)return; const o=r.canvas.getActiveObject(); if(o){r.canvas.bringForward(o);r.canvas.renderAll();snapshot();} };
  const bwd=()=>{ const r=fabricRef.current; if(!r)return; const o=r.canvas.getActiveObject(); if(o){r.canvas.sendBackwards(o);r.canvas.renderAll();snapshot();} };
  const del=()=>{ const r=fabricRef.current; if(!r)return; const o=r.canvas.getActiveObject(); if(o){r.canvas.remove(o);r.canvas.renderAll();} };
  const dup=()=>{
    const r=fabricRef.current; if(!r)return;
    const o=r.canvas.getActiveObject(); if(!o)return;
    o.clone((c:any)=>{ c.set({left:o.left+20,top:o.top+20,selectable:true}); r.canvas.add(c); r.canvas.setActiveObject(c); r.canvas.renderAll(); });
  };
  const clearAll=()=>{ const r=fabricRef.current; if(!r)return; batch(()=>{ r.canvas.clear(); r.canvas.backgroundColor=bgColor; r.canvas.renderAll(); }); setSelTpl(null); setSelFrame("none"); };

  const exportPNG=()=>{
    const r=fabricRef.current; if(!r)return;
    const url=r.canvas.toDataURL({format:"png",multiplier:3});
    const name="غلاف.png";
    const a=document.createElement("a"); a.href=url; a.download=name; a.click();
    try{ addFile({name,type:"image",dataUrl:url,source:"designer"}); bumpUsage({operations:1}); }catch{}
  };

  const exportPDF=async()=>{
    const r=fabricRef.current; if(!r)return;
    const {jsPDF}=await import("jspdf");
    const url=r.canvas.toDataURL({format:"png",multiplier:3});
    const pdf=new jsPDF({orientation:"portrait",unit:"mm",format:"a4"});
    pdf.addImage(url,"PNG",0,0,210,297);
    const name="غلاف.pdf";
    pdf.save(name);
    try{
      const dataUrl=pdf.output("datauristring");
      addFile({name,type:"pdf",dataUrl,source:"designer"});
      bumpUsage({operations:1});
    }catch{}
  };

  const visibleTpls = cat==="الكل" ? TEMPLATES : TEMPLATES.filter(t=>t.cat===cat);

  const TABS: {id:TabType; label:string; icon:React.ReactNode}[] = [
    {id:"templates", label:"قوالب",   icon:<Palette className="w-3.5 h-3.5"/>},
    {id:"text",      label:"نص",      icon:<Type className="w-3.5 h-3.5"/>},
    {id:"shapes",    label:"أشكال",   icon:<Square className="w-3.5 h-3.5"/>},
    {id:"frames",    label:"إطارات",  icon:<Square className="w-3.5 h-3.5"/>},
    {id:"stickers",  label:"ستيكرات", icon:<Smile className="w-3.5 h-3.5"/>},
    {id:"bg",        label:"خلفية",   icon:<ImageIcon className="w-3.5 h-3.5"/>},
  ];

  return (
    <div className="flex flex-col gap-4" style={{minHeight:"calc(100vh - 120px)"}}>
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-4">
          <div className="w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0"
            style={{background:"linear-gradient(135deg,#EC4899,#8B5CF6)"}}>
            <Palette className="w-5 h-5 text-white"/>
          </div>
          <div>
            <h1 className="text-xl font-800 text-slate-100">مصمم الأغلفة</h1>
            <p className="text-xs text-slate-500">انقر مزدوج على أي نص في القالب لتعديله</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={undo} disabled={!canUndo} title="تراجع (Ctrl+Z)"
            className="w-9 h-9 rounded-xl flex items-center justify-center bg-white/5 text-slate-300 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all">
            <Undo className="w-4 h-4"/>
          </button>
          <button onClick={redo} disabled={!canRedo} title="إعادة (Ctrl+Shift+Z)"
            className="w-9 h-9 rounded-xl flex items-center justify-center bg-white/5 text-slate-300 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all">
            <Redo className="w-4 h-4"/>
          </button>
          <div className="w-px h-9 bg-white/10 mx-0.5"/>
          <Button variant="glass" size="sm" onClick={exportPNG}><Download className="w-4 h-4"/>PNG</Button>
          <Button variant="gold" size="sm" onClick={exportPDF}><Download className="w-4 h-4"/>PDF</Button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-4 flex-1">
        {/* ── Panel ── */}
        <div className="w-full lg:w-56 flex-shrink-0 flex flex-col gap-3">
          {/* Tabs */}
          <div className="glass-card p-1.5 grid grid-cols-6 gap-1">
            {TABS.map(t=>(
              <button key={t.id} onClick={()=>setTab(t.id)}
                className={cn("flex flex-col items-center gap-0.5 py-1.5 rounded-lg text-[10px] font-600 transition-all",
                  tab===t.id ? "bg-gold-500/20 text-gold-400" : "text-slate-500 hover:text-slate-300 hover:bg-white/5")}>
                {t.icon}
                <span>{t.label}</span>
              </button>
            ))}
          </div>

          {/* Panel content */}
          <div className="glass-card p-3 flex-1 overflow-y-auto space-y-3" style={{maxHeight:"calc(100vh - 260px)"}}>

            {tab==="templates"&&(
              <div className="space-y-2">
                <div className="flex gap-1 flex-wrap">
                  {CATS.map(c=>(
                    <button key={c} onClick={()=>setCat(c)}
                      className={cn("px-2.5 py-1 rounded-lg text-xs font-600 transition-all",
                        cat===c ? "bg-gold-500/20 text-gold-400 border border-gold-500/30" : "text-slate-500 hover:text-slate-300 bg-white/5")}>
                      {c}
                    </button>
                  ))}
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {visibleTpls.map(tpl=>(
                    <button key={tpl.id} onClick={()=>applyTemplate(tpl)}
                      className={cn("p-3 rounded-xl text-center transition-all hover:scale-105 active:scale-95",
                        selTpl===tpl.id ? "ring-2 ring-gold-400/70 bg-gold-500/10" : "bg-white/5 hover:bg-white/8")}>
                      <div className="text-2xl mb-1">{tpl.emoji}</div>
                      <div className="text-[11px] font-600 text-slate-300 leading-tight">{tpl.name}</div>
                      <div className="text-[9px] text-slate-600 mt-0.5">{tpl.cat}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {tab==="text"&&(
              <div className="space-y-3">
                <textarea value={txtVal} onChange={e=>setTxtVal(e.target.value)} rows={2}
                  className="input-glass w-full text-sm resize-none" placeholder="محتوى النص..."/>
                <div>
                  <label className="text-xs text-slate-500 block mb-1">الخط</label>
                  <select value={fontFam} onChange={e=>setFontFam(e.target.value)}
                    className="input-glass w-full text-sm">
                    {FONTS.map(f=><option key={f} value={f}>{f}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-slate-500 block mb-1">الحجم: {fSize}px</label>
                  <input type="range" min={8} max={96} value={fSize} onChange={e=>setFSize(+e.target.value)} className="w-full"/>
                </div>
                <div>
                  <label className="text-xs text-slate-500 block mb-1">اللون</label>
                  <div className="grid grid-cols-5 gap-1.5 mb-2">
                    {COLORS.map(c=>(
                      <button key={c} onClick={()=>setColor(c)}
                        className="w-8 h-8 rounded-lg transition-all hover:scale-110"
                        style={{background:c,outline:color===c?"2px solid #F59E0B":"2px solid rgba(255,255,255,0.1)",outlineOffset:"2px"}}/>
                    ))}
                  </div>
                  <input type="color" value={color} onChange={e=>setColor(e.target.value)} className="w-full h-8 rounded-lg cursor-pointer border-0 bg-transparent"/>
                </div>
                <div className="flex gap-2">
                  <button onClick={()=>setBold(b=>!b)}
                    className={cn("flex-1 py-2 rounded-xl text-sm font-700 transition-all flex items-center justify-center gap-1",
                      bold ? "bg-gold-500/20 text-gold-400 border border-gold-500/30" : "bg-white/5 text-slate-500 hover:text-white")}>
                    <Bold className="w-3.5 h-3.5"/>عريض
                  </button>
                  <button onClick={()=>setItalic(i=>!i)}
                    className={cn("flex-1 py-2 rounded-xl text-sm font-600 italic transition-all flex items-center justify-center gap-1",
                      italic ? "bg-electric-500/20 text-electric-400 border border-electric-500/30" : "bg-white/5 text-slate-500 hover:text-white")}>
                    <Italic className="w-3.5 h-3.5"/>مائل
                  </button>
                </div>
                <Button variant="gold" size="sm" className="w-full" onClick={addText}>
                  <Type className="w-3.5 h-3.5"/>إضافة نص
                </Button>
              </div>
            )}

            {tab==="shapes"&&(
              <div className="space-y-3">
                <label className="text-xs text-slate-500 block mb-1">لون الشكل</label>
                <div className="grid grid-cols-5 gap-1.5 mb-2">
                  {COLORS.map(c=>(
                    <button key={c} onClick={()=>setColor(c)}
                      className="w-8 h-8 rounded-lg transition-all hover:scale-110"
                      style={{background:c,outline:color===c?"2px solid #F59E0B":"2px solid rgba(255,255,255,0.1)",outlineOffset:"2px"}}/>
                  ))}
                </div>
                <input type="color" value={color} onChange={e=>setColor(e.target.value)} className="w-full h-8 rounded-lg cursor-pointer border-0 bg-transparent mb-1"/>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    {type:"rect"     as const, label:"مستطيل",  icon:<Square className="w-5 h-5"/>},
                    {type:"circle"   as const, label:"دائرة",    icon:<Circle className="w-5 h-5"/>},
                    {type:"triangle" as const, label:"مثلث",     icon:"▲"},
                  ].map(s=>(
                    <button key={s.type} onClick={()=>addShape(s.type)}
                      className="p-3 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs flex flex-col items-center gap-2 transition-all hover:scale-105">
                      <span className="text-2xl">{typeof s.icon==="string"?s.icon:s.icon}</span>
                      {s.label}
                    </button>
                  ))}
                  <button onClick={addLine}
                    className="p-3 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs flex flex-col items-center gap-2 transition-all hover:scale-105">
                    <Minus className="w-5 h-5"/>خط
                  </button>
                </div>
                <div>
                  <p className="text-[10px] text-slate-600 mb-1.5 font-600">جرافيكس مدرسية</p>
                  <div className="grid grid-cols-4 gap-1.5">
                    {GRAPHICS.map(g=>(
                      <button key={g.id} onClick={()=>addGraphic(g)} title={g.label}
                        className="aspect-square rounded-xl bg-white/5 hover:bg-white/12 flex items-center justify-center text-xl transition-all hover:scale-110 active:scale-95">
                        {g.emoji}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <input ref={fileImgRef} type="file" accept="image/*" onChange={handleImg} className="hidden"/>
                  <Button variant="glass" size="sm" className="w-full" onClick={()=>fileImgRef.current?.click()}>
                    <ImageIcon className="w-3.5 h-3.5"/>رفع صورة
                  </Button>
                </div>
              </div>
            )}

            {tab==="frames"&&(
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-slate-500 block mb-1">لون الإطار</label>
                  <div className="grid grid-cols-5 gap-1.5 mb-2">
                    {COLORS.map(c=>(
                      <button key={c} onClick={()=>setColor(c)}
                        className="w-8 h-8 rounded-lg transition-all hover:scale-110"
                        style={{background:c,outline:color===c?"2px solid #F59E0B":"2px solid rgba(255,255,255,0.1)",outlineOffset:"2px"}}/>
                    ))}
                  </div>
                  <input type="color" value={color} onChange={e=>setColor(e.target.value)} className="w-full h-8 rounded-lg cursor-pointer border-0 bg-transparent"/>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {FRAMES.map(fr=>(
                    <button key={fr.id} onClick={()=>applyFrame(fr)}
                      className={cn("p-3 rounded-xl text-center text-xs font-600 transition-all hover:scale-105",
                        selFrame===fr.id ? "ring-2 ring-gold-400/70 bg-gold-500/10 text-gold-400" : "bg-white/5 hover:bg-white/10 text-slate-300")}>
                      <div className="w-full h-10 mb-1.5 rounded-md flex items-center justify-center"
                        style={{border:fr.id==="none"?"none":`2px ${fr.id==="dashed"?"dashed":"solid"} ${fr.color}`}}>
                        {fr.id==="none"&&<span className="text-slate-600 text-lg">∅</span>}
                      </div>
                      {fr.name}
                    </button>
                  ))}
                </div>
                <p className="text-[10px] text-slate-600 leading-relaxed">يطبّق الإطار على حواف الغلاف. غيّر اللون ثم اختر النمط.</p>
              </div>
            )}

            {tab==="stickers"&&(
              <div className="space-y-3">
                {STICKERS.map(group=>(
                  <div key={group.group}>
                    <p className="text-[10px] text-slate-600 mb-1.5 font-600">{group.group}</p>
                    <div className="grid grid-cols-5 gap-1.5">
                      {group.items.map(s=>(
                        <button key={s} onClick={()=>addSticker(s)}
                          className="w-9 h-9 rounded-xl bg-white/5 hover:bg-white/12 flex items-center justify-center text-xl transition-all hover:scale-110 active:scale-95">
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {tab==="bg"&&(
              <div className="space-y-3">
                <label className="text-xs text-slate-500 block">اختر الخلفية</label>
                <input type="color" value={bgColor} onChange={e=>changeBg(e.target.value)} className="w-full h-10 rounded-xl cursor-pointer border-0 bg-transparent"/>
                <div className="grid grid-cols-5 gap-2">
                  {BG_PRESETS.map(c=>(
                    <button key={c} onClick={()=>changeBg(c)}
                      className="w-9 h-9 rounded-xl border-2 transition-all hover:scale-110"
                      style={{background:c,borderColor:bgColor===c?"#F59E0B":"rgba(255,255,255,0.1)"}}/>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Object controls */}
          <div className="glass-card p-3">
            <div className="flex items-center justify-between mb-2">
              <p className="text-[10px] text-slate-600 font-600">التحكم في العنصر المحدد</p>
              {!hasSel && <span className="text-[9px] text-gold-500/70 font-600">اختر عنصراً أولاً</span>}
            </div>
            <div className="grid grid-cols-4 gap-1.5">
              {[
                {fn:fwd, icon:<ChevronUp className="w-4 h-4"/>,   label:"أمام", cls:""},
                {fn:bwd, icon:<ChevronDown className="w-4 h-4"/>, label:"خلف",  cls:""},
                {fn:dup, icon:<Copy className="w-4 h-4"/>,         label:"نسخ",  cls:""},
                {fn:del, icon:<Trash2 className="w-4 h-4"/>,       label:"حذف",  cls:"text-red-400 bg-red-500/10 hover:bg-red-500/20"},
              ].map(({fn,icon,label,cls})=>(
                <button key={label} onClick={fn} disabled={!hasSel}
                  className={cn("flex flex-col items-center gap-0.5 p-2 rounded-xl text-[10px] font-600 transition-all disabled:opacity-30 disabled:cursor-not-allowed",
                    cls || "bg-white/5 hover:bg-white/10 text-slate-400 hover:text-slate-200")}>
                  {icon}{label}
                </button>
              ))}
            </div>
            {/* Layering + alignment */}
            <div className="grid grid-cols-4 gap-1.5 mt-1.5">
              {[
                {fn:toFront, icon:<ChevronsUp className="w-4 h-4"/>,   label:"للأمام"},
                {fn:toBack,  icon:<ChevronsDown className="w-4 h-4"/>, label:"للخلف"},
                {fn:()=>alignCenter("h"), icon:<span className="text-sm leading-none">↔</span>, label:"توسيط"},
                {fn:()=>alignCenter("v"), icon:<span className="text-sm leading-none">↕</span>, label:"توسيط"},
              ].map(({fn,icon,label},i)=>(
                <button key={i} onClick={fn} disabled={!hasSel}
                  className="flex flex-col items-center gap-0.5 p-2 rounded-xl text-[10px] font-600 bg-white/5 hover:bg-white/10 text-slate-400 hover:text-slate-200 transition-all disabled:opacity-30 disabled:cursor-not-allowed">
                  {icon}{label}
                </button>
              ))}
            </div>

            {/* Opacity */}
            <div className="mt-2">
              <div className="flex justify-between text-[10px] text-slate-600 mb-1">
                <span>الشفافية</span><span className="text-gold-400 font-700">{opacity}%</span>
              </div>
              <input type="range" min={10} max={100} value={opacity} disabled={!hasSel}
                onChange={e=>changeOpacity(+e.target.value)} className="w-full disabled:opacity-40"/>
            </div>

            <button onClick={clearAll}
              className="w-full mt-2 py-1.5 rounded-xl text-xs text-slate-600 hover:text-red-400 hover:bg-red-500/5 transition-all flex items-center justify-center gap-1">
              <RotateCcw className="w-3 h-3"/>مسح الكل
            </button>
          </div>
        </div>

        {/* ── Canvas ── */}
        <div className="flex-1 flex items-start justify-center overflow-x-auto">
          <div className="flex-shrink-0">
            <div className="relative" style={{width:420,height:594}}>
              {/* The canvas must stay visible while Fabric initialises, otherwise
                  its mouse-interaction layer is created with a zero size and
                  selecting / dragging objects stops working. */}
              <div className="rounded-2xl overflow-hidden"
                style={{boxShadow:"0 30px 80px rgba(0,0,0,0.7),0 0 0 1px rgba(255,255,255,0.06)"}}>
                <canvas ref={canvasRef}/>
              </div>
              {!loaded&&(
                <div className="absolute inset-0 flex items-center justify-center rounded-2xl bg-navy-900 z-10">
                  <div className="text-center text-slate-500">
                    <div className="w-8 h-8 border-2 border-gold-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"/>
                    <p className="text-sm">جاري تحميل المصمم...</p>
                  </div>
                </div>
              )}
              {/* Editing hint */}
              {loaded&&hint&&(
                <div className="absolute top-4 left-1/2 -translate-x-1/2 whitespace-nowrap px-4 py-2 rounded-xl text-xs font-600 text-gold-400 pointer-events-none"
                  style={{background:"rgba(245,158,11,0.12)",border:"1px solid rgba(245,158,11,0.3)"}}>
                  💡 انقر مزدوج على أي نص لتعديله
                </div>
              )}
            </div>
            {loaded&&<p className="text-center text-xs text-slate-700 mt-2">420 × 594 — A4</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
