"use client";

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { supabase, isSupabaseConfigured } from '@/lib/supabaseClient';

export default function VisitorTracker() {
  const pathname = usePathname();
  const visitorUuidRef = useRef(null);
  const isSavedToSupabaseRef = useRef(false);
  const startTimeRef = useRef(null);
  const initialDurationRef = useRef(0);
  const intervalRef = useRef(null);

  useEffect(() => {
    // Only run on the client side
    if (typeof window === 'undefined') return;

    startTimeRef.current = Date.now();
    
    // Retrieve or generate a persistent unique visitor UUID
    let visitorUuid = localStorage.getItem('zuca_visitor_uuid');
    if (!visitorUuid) {
      visitorUuid = 'vis_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
      localStorage.setItem('zuca_visitor_uuid', visitorUuid);
    }
    visitorUuidRef.current = visitorUuid;

    const trackUniqueSession = async () => {
      const ua = navigator.userAgent;
      
      const getBrowserInfo = () => {
        let tem;
        let M = ua.match(/(opera|chrome|safari|firefox|msie|trident(?=\/))\/?\s*(\d+)/i) || [];
        if (/trident/i.test(M[1])) {
          tem = /\brv[ :]+(\d+)/g.exec(ua) || [];
          return { name: 'IE', version: tem[1] || '' };
        }
        if (M[1] === 'Chrome') {
          tem = ua.match(/\b(OPR|Edge|Edg)\/(\d+)/);
          if (tem != null) return { name: tem[1].replace('OPR', 'Opera').replace('Edg', 'Edge'), version: tem[2] };
        }
        M = M[2] ? [M[1], M[2]] : [navigator.appName, navigator.appVersion, '-?'];
        if ((tem = ua.match(/version\/(\d+)/i)) != null) M.splice(1, 1, tem[1]);
        return { name: M[0], version: M[1] };
      };

      const getOSAndDevice = () => {
        let osName = "Unknown OS";
        let deviceModel = "Desktop/Laptop";
        let isMobile = false;

        if (/windows phone/i.test(ua)) {
          osName = "Windows Phone";
          isMobile = true;
          deviceModel = "Windows Phone Device";
        } else if (/android/i.test(ua)) {
          osName = "Android";
          isMobile = true;
          const detailedMatches = ua.match(/\(([^)]+)\)/);
          if (detailedMatches && detailedMatches[1]) {
            const parts = detailedMatches[1].split(';');
            const modelPart = parts.find(p => p.includes('Build/') || /SM-|GT-|Pixel|Redmi|Mi\s|Moto|LG-|HTC|Nexus|HUAWEI|VIVO|OPPO/i.test(p));
            if (modelPart) {
              deviceModel = modelPart.replace(/Build\/.*/, '').trim();
            } else {
              deviceModel = parts[parts.length - 1].trim();
            }
          } else {
            deviceModel = "Android Device";
          }
        } else if (/ipad|iphone|ipod/i.test(ua)) {
          osName = "iOS";
          isMobile = true;
          if (/iphone/i.test(ua)) {
            deviceModel = "Apple iPhone";
            const w = window.screen.width;
            const h = window.screen.height;
            if (w === 430 && h === 932) deviceModel = "Apple iPhone 14 Pro Max / 15 Plus";
            else if (w === 393 && h === 852) deviceModel = "Apple iPhone 14 Pro / 15";
            else if (w === 428 && h === 926) deviceModel = "Apple iPhone 12/13 Pro Max";
            else if (w === 390 && h === 844) deviceModel = "Apple iPhone 12/13/14";
            else if (w === 414 && h === 896) deviceModel = "Apple iPhone XR / 11";
            else if (w === 375 && h === 812) deviceModel = "Apple iPhone X / XS / 11 Pro";
          } else if (/ipad/i.test(ua)) {
            deviceModel = "Apple iPad";
          } else {
            deviceModel = "Apple iPod";
          }
        } else if (/macintosh/i.test(ua)) {
          osName = "macOS";
          deviceModel = "Apple Mac";
        } else if (/windows/i.test(ua)) {
          osName = "Windows";
          deviceModel = "Windows PC";
        } else if (/linux/i.test(ua)) {
          osName = "Linux";
          deviceModel = "Linux PC";
        }

        return { osName, deviceModel, isMobile };
      };

      const browser = getBrowserInfo();
      const osAndDevice = getOSAndDevice();
      const screenResolution = `${window.screen.width}x${window.screen.height}`;
      const language = navigator.language || "pt-MZ";

      let locationCity = "Maputo";
      let locationRegion = "Maputo Cidade";
      let locationCountry = "Moçambique";
      let locationCountryCode = "MZ";
      let ipAddress = "102.219.124.5";

      try {
        const geoResponse = await fetch('https://ipapi.co/json/').then(r => r.json());
        if (geoResponse && !geoResponse.error) {
          locationCity = geoResponse.city || locationCity;
          locationRegion = geoResponse.region || locationRegion;
          locationCountry = geoResponse.country_name || locationCountry;
          locationCountryCode = geoResponse.country_code || locationCountryCode;
          ipAddress = geoResponse.ip || ipAddress;
        }
      } catch (err) {
        console.warn("Could not retrieve IP geolocation details, using defaults:", err);
      }

      let existingDuration = 0;
      let existingVisits = 1;

      // Check for existing unique visitor information in Supabase
      if (isSupabaseConfigured && supabase) {
        try {
          const { data, error } = await supabase
            .from('visitors')
            .select('session_duration, visit_count, last_active')
            .eq('visitor_uuid', visitorUuid)
            .maybeSingle();

          if (!error && data) {
            existingDuration = data.session_duration || 0;
            existingVisits = data.visit_count || 1;
            
            // If the last active heartbeat was over 30 minutes ago, increment the session count
            const lastActiveTime = new Date(data.last_active).getTime();
            if (Date.now() - lastActiveTime > 30 * 60 * 1000) {
              existingVisits += 1;
            }
          }
        } catch (err) {
          console.warn("Error checking unique visitor in Supabase:", err);
        }
      } else {
        // Fallback to local storage unique visitor check
        try {
          const localLogs = JSON.parse(localStorage.getItem('zuca_local_visitors') || '[]');
          const record = localLogs.find(l => l.visitor_uuid === visitorUuid);
          if (record) {
            existingDuration = record.session_duration || 0;
            existingVisits = record.visit_count || 1;
            const lastActiveTime = new Date(record.last_active).getTime();
            if (Date.now() - lastActiveTime > 30 * 60 * 1000) {
              existingVisits += 1;
            }
          }
        } catch (err) {
          // Ignore
        }
      }

      initialDurationRef.current = existingDuration;

      const visitorData = {
        visitor_uuid: visitorUuid,
        is_mobile: osAndDevice.isMobile,
        location_city: locationCity,
        location_country: locationCountry,
        location_country_code: locationCountryCode,
        location_region: locationRegion,
        browser_name: browser.name,
        browser_version: browser.version,
        os_name: osAndDevice.osName,
        device_model: osAndDevice.deviceModel,
        screen_resolution: screenResolution,
        language: language,
        session_duration: existingDuration,
        visit_count: existingVisits,
        page_visited: pathname,
        ip_address: ipAddress,
        last_active: new Date().toISOString()
      };

      // Upsert unique record
      if (isSupabaseConfigured && supabase) {
        try {
          const { error } = await supabase
            .from('visitors')
            .upsert(visitorData, { onConflict: 'visitor_uuid' });

          if (error) {
            console.error("Supabase unique visitor upsert failed:", error);
          } else {
            isSavedToSupabaseRef.current = true;
          }
        } catch (err) {
          console.error("Failed to execute Supabase unique visitor upsert:", err);
        }
      }

      // Update local storage backup list
      try {
        const localLogs = JSON.parse(localStorage.getItem('zuca_local_visitors') || '[]');
        const localRecord = {
          id: visitorUuid,
          created_at: new Date().toISOString(),
          ...visitorData
        };

        const updatedLogs = [localRecord, ...localLogs.filter(l => l.visitor_uuid !== visitorUuid)].slice(0, 50);
        localStorage.setItem('zuca_local_visitors', JSON.stringify(updatedLogs));
      } catch (err) {
        console.warn("Failed to write unique visitor record to localStorage:", err);
      }
    };

    trackUniqueSession();

    // Heartbeat update every 10 seconds to log accumulated session duration
    intervalRef.current = setInterval(async () => {
      if (!visitorUuidRef.current) return;
      
      const elapsed = Math.round((Date.now() - startTimeRef.current) / 1000);
      const totalDuration = initialDurationRef.current + elapsed;

      // Update in Supabase
      if (isSavedToSupabaseRef.current && isSupabaseConfigured && supabase) {
        try {
          await supabase
            .from('visitors')
            .update({ 
              session_duration: totalDuration,
              last_active: new Date().toISOString()
            })
            .eq('visitor_uuid', visitorUuidRef.current);
        } catch (err) {
          console.warn("Supabase session duration update heartbeat error:", err);
        }
      }

      // Update in Local Storage
      try {
        const localLogs = JSON.parse(localStorage.getItem('zuca_local_visitors') || '[]');
        const updatedLogs = localLogs.map(log => {
          if (log.visitor_uuid === visitorUuidRef.current) {
            return {
              ...log,
              session_duration: totalDuration,
              last_active: new Date().toISOString()
            };
          }
          return log;
        });
        localStorage.setItem('zuca_local_visitors', JSON.stringify(updatedLogs));
      } catch (err) {
        // Ignore
      }
    }, 10000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [pathname]);

  return null;
}
