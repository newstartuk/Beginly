"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Archive, Bell, Check, RotateCcw } from "lucide-react";

type Notification = { id:string;title:string;message:string;state:string;actionUrl?:string;readAt:string|null;createdAt:string };
export default function NotificationsClient(){
  const[items,setItems]=useState<Notification[]>([]);const[status,setStatus]=useState("Loading notifications…");
  const load=()=>fetch("/api/platform/notifications").then(async response=>{const data=await response.json();if(!response.ok)throw new Error(data.error?.message??"Notifications could not be loaded.");setItems(data.notifications??[]);setStatus("")}).catch(error=>setStatus(error instanceof Error?error.message:"Notifications could not be loaded."));
  useEffect(()=>{load()},[]);
  async function update(id:string,action:"read"|"unread"|"archive"){
    setStatus("Updating…");const response=await fetch(`/api/platform/notifications/${id}`,{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({action})});
    if(!response.ok){const data=await response.json().catch(()=>({}));setStatus(data.error?.message??"Notification could not be updated.");return}await load();
  }
  if(status&&items.length===0)return <div className="notification-empty"><Bell/><p>{status}</p></div>;
  return <><section className="notification-summary"><div><span>Notification centre</span><strong>{items.filter(item=>!item.readAt).length}</strong><small>unread updates</small></div><p>Journey, opportunity, household, support and entitlement updates remain visible without relying on push delivery.</p></section><div className="notification-list">{items.length===0?<div className="notification-empty"><Check/><p>You are all caught up.</p></div>:items.map(item=><article key={item.id} className={item.readAt?"read":"unread"}><div className="notification-icon"><Bell size={18}/></div><div><div className="notification-meta"><span>{new Date(item.createdAt).toLocaleString()}</span>{!item.readAt&&<b>New</b>}</div><h2>{item.title}</h2><p>{item.message}</p><footer>{item.actionUrl&&<Link className="platform-primary" href={item.actionUrl}>Open update</Link>}<button className="platform-secondary" onClick={()=>update(item.id,item.readAt?"unread":"read")}>{item.readAt?<><RotateCcw size={14}/> Mark unread</>:<><Check size={14}/> Mark read</>}</button><button className="platform-secondary" onClick={()=>update(item.id,"archive")}><Archive size={14}/> Archive</button></footer></div></article>)}</div>{status&&<p aria-live="polite">{status}</p>}</>;
}
