import { NextResponse } from "next/server";
import PocketBase from 'pocketbase';
const pb = new PocketBase(process.env.NEXT_PUBLIC_POCKETURL);
pb.autoCancellation(false);

export async function middleware(req) {
    const url = 'https://updates.jamesmowat.com/';
    try {
        const record = await pb.collection('server').getFirstListItem('option="service"');
        
        try {
            const isInMaintance = record.value;
            if (isInMaintance) {
                return NextResponse.redirect(url)
            }
        } catch (error) {
            return
        }
    } catch (err){
        console.log(err)
        return NextResponse.redirect(url)
    }
}