"use client";
import { useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
export default function MediaViewTracker({mediaId}:{mediaId:string}){
 useEffect(()=>{const key=`malvis-media-viewed-${mediaId}`;if(sessionStorage.getItem(key))return;sessionStorage.setItem(key,"1");void createClient().from("media_views").insert({media_id:mediaId});},[mediaId]);
 return null;
}
