/**
 * Scan Workers Screen — Step 3 of booking flow
 * Google Maps radar — workers from useNearbyWorkers (real API / mock fallback)
 * User = green pulsing dot · Worker = compact avatar card
 * Tap = name popup · Double-tap / long-press = worker detail screen
 */

import { useNearbyWorkers } from "@/hooks/useNearbyWorkers";
import { useUserLocation } from "@/hooks/useUserLocation";
import {
  serviceIdToLabel,
  serviceIdToWorkerType,
  type WorkerWithLocation,
} from "@/services/worker-location.service";
import { Ionicons } from "@expo/vector-icons";
import { Href, router, useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Animated,
  Easing,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { WebView, WebViewMessageEvent } from "react-native-webview";

// ─── Types ────────────────────────────────────────────────────────────────────

type WorkerMapItem = {
  id: string;
  name: string;
  avatar: string;
  rating: number;
  reviewCount: number;
  completedJobs: number;
  lat: number;
  lng: number;
  distanceKm: number;
  estimatedArrival: number;
  dailyRate: number;
  verified: boolean;
  experience: number;
  workerType: string;
};

// ─── Config ───────────────────────────────────────────────────────────────────

const GMAPS_KEY =
  process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY ??
  process.env.GOOGLE_MAPS_API_KEY ??
  "";

const SCAN_RADIUS_M = 2500; // 2.5 km

// ─── Map HTML ─────────────────────────────────────────────────────────────────

function buildMapHtml(
  lat: number,
  lng: number,
  radiusMeters: number,
  apiKey: string,
): string {
  return `<!DOCTYPE html>
<html>
<head>
<meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no"/>
<style>
*{margin:0;padding:0;box-sizing:border-box}
html,body,#map{width:100%;height:100%;overflow:hidden}

/* ── User location dot (green) ── */
.udot-wrap{position:relative;width:0;height:0;pointer-events:none}
.udot{
  width:16px;height:16px;border-radius:50%;
  background:#22C55E;border:3px solid #fff;
  box-shadow:0 0 0 2px rgba(34,197,94,.3),0 2px 8px rgba(0,0,0,.25);
  position:absolute;transform:translate(-50%,-50%);z-index:3}
.uring{
  position:absolute;border-radius:50%;
  border:1.5px solid rgba(34,197,94,.5);
  transform:translate(-50%,-50%);
  animation:upulse 2.2s ease-out infinite;pointer-events:none}
.uring.d2{animation-delay:.73s}
.uring.d3{animation-delay:1.46s}
@keyframes upulse{
  0%{width:0;height:0;opacity:.9}
  100%{width:90px;height:90px;opacity:0}}

/* ── Scan waves (pulsing while scanning) ── */
.swave{
  position:absolute;border-radius:50%;
  border:1.5px solid rgba(13,148,136,.55);
  transform:translate(-50%,-50%);
  animation:spulse 2.2s ease-out infinite;pointer-events:none}
.swave.d1{animation-delay:.73s}
.swave.d2{animation-delay:1.46s}
@keyframes spulse{
  0%{width:10px;height:10px;opacity:.85}
  100%{width:360px;height:360px;opacity:0}}

/* ── Worker pin ── */
.wpin{
  position:relative;
  display:flex;flex-direction:column;align-items:center;
  cursor:pointer;
  /* anchor bottom-center at lat/lng (OverlayView sets translate(-50%,-100%)) */
}

/* avatar wrapper — allows positioning verified badge */
.wavwrap{position:relative;display:inline-block}

.wav{
  width:38px;height:38px;border-radius:50%;overflow:hidden;
  border:2.5px solid #fff;
  box-shadow:0 2px 8px rgba(0,0,0,.22);
  background:#d1d5db;display:flex;align-items:center;justify-content:center}
.wav img{width:100%;height:100%;object-fit:cover;display:block}
.wav-init{
  width:38px;height:38px;border-radius:50%;
  border:2.5px solid #fff;
  box-shadow:0 2px 8px rgba(0,0,0,.22);
  background:#0D9488;color:#fff;
  font-size:14px;font-weight:700;
  display:flex;align-items:center;justify-content:center}

.wvbadge{
  position:absolute;bottom:0;right:0;
  width:13px;height:13px;border-radius:50%;
  background:#10b981;border:2px solid #fff;
  display:flex;align-items:center;justify-content:center;
  font-size:7px;color:#fff;font-weight:700;line-height:1}

.wrating{
  background:#f59e0b;color:#fff;
  font-size:9.5px;font-weight:700;
  padding:2px 6px;border-radius:10px;
  margin-top:3px;letter-spacing:.2px;
  box-shadow:0 1px 3px rgba(0,0,0,.18)}

.wptr{
  width:0;height:0;
  border-left:5px solid transparent;
  border-right:5px solid transparent;
  border-top:6px solid #f59e0b;
  margin-top:-1px}

/* name popup (above pin, hidden by default) */
.wname{
  position:absolute;
  bottom:calc(100% + 6px);left:50%;
  transform:translateX(-50%);
  background:rgba(15,23,42,.9);color:#fff;
  font-size:11px;font-weight:600;
  padding:4px 10px;border-radius:8px;
  white-space:nowrap;pointer-events:none;
  opacity:0;transition:opacity .18s;
  box-shadow:0 2px 8px rgba(0,0,0,.25);
  backdrop-filter:blur(4px)}
.wname.show{opacity:1}
.wname::after{
  content:'';position:absolute;top:100%;left:50%;
  transform:translateX(-50%);
  border-left:5px solid transparent;border-right:5px solid transparent;
  border-top:5px solid rgba(15,23,42,.9)}
</style>
</head>
<body>
<div id="map"></div>
<script>
var USER={lat:${lat},lng:${lng}};
var RADIUS=${radiusMeters};

function postRN(p){
  try{window.ReactNativeWebView.postMessage(JSON.stringify(p));}
  catch(e){try{window.postMessage(JSON.stringify(p),'*');}catch(e2){}}
}

function sendLog(){
  var args=Array.prototype.slice.call(arguments);
  postRN({type:'webLog',message:args.join(' ')});
}

/* hook console */
(function(){
  var ol=console.log,oe=console.error,ow=console.warn;
  console.log=function(){sendLog('[log]',[].join.call(arguments,' '));ol&&ol.apply(console,arguments);};
  console.warn=function(){sendLog('[warn]',[].join.call(arguments,' '));ow&&ow.apply(console,arguments);};
  console.error=function(){sendLog('[err]',[].join.call(arguments,' '));oe&&oe.apply(console,arguments);};
})();

window.onerror=function(msg,src,line,col,err){
  postRN({type:'mapError',message:String(msg),source:String(src||''),lineno:line||0,stack:err&&err.stack?String(err.stack):''});
};
window.gm_authFailure=function(){
  postRN({type:'mapError',message:'gm_authFailure: Maps auth failed'});
};

var map,scanCircle,scanOvs=[],workerOvs=[];

/* ── Generic OverlayView factory ── */
function mkOverlay(latlng,el,z,anchorBottom){
  function Ov(){}
  Ov.prototype=new google.maps.OverlayView();
  Ov.prototype.onAdd=function(){
    var d=document.createElement('div');
    d.style.position='absolute';
    d.style.zIndex=String(z||1);
    if(anchorBottom!==false) d.style.transform='translate(-50%,-100%)';
    else d.style.transform='translate(-50%,-50%)';
    d.appendChild(el);
    this._div=d;
    this.getPanes().overlayMouseTarget.appendChild(d);
  };
  Ov.prototype.draw=function(){
    var proj=this.getProjection();
    if(!proj||!this._div)return;
    var pt=proj.fromLatLngToDivPixel(latlng);
    if(!pt)return;
    this._div.style.left=pt.x+'px';
    this._div.style.top=pt.y+'px';
  };
  Ov.prototype.onRemove=function(){
    if(this._div&&this._div.parentNode)this._div.parentNode.removeChild(this._div);
    this._div=null;
  };
  var o=new Ov();
  o.setMap(map);
  return o;
}

/* ── User green dot ── */
function makeUserDot(){
  var wrap=document.createElement('div');
  wrap.className='udot-wrap';
  wrap.innerHTML='<div class="uring"></div><div class="uring d2"></div><div class="uring d3"></div><div class="udot"></div>';
  return wrap;
}

/* ── Scan waves ── */
function makeScanWaves(){
  var wrap=document.createElement('div');
  wrap.style.cssText='position:absolute;width:0;height:0;pointer-events:none';
  ['','d1','d2'].forEach(function(cls){
    var w=document.createElement('div');
    w.className='swave'+(cls?' '+cls:'');
    wrap.appendChild(w);
  });
  return wrap;
}

/* ── Worker pin element ── */
function makeWorkerPin(w){
  var pin=document.createElement('div');
  pin.className='wpin';

  /* name popup */
  var nm=document.createElement('div');
  nm.className='wname';
  nm.textContent=w.name;
  pin.appendChild(nm);

  /* avatar wrapper */
  var awrap=document.createElement('div');
  awrap.className='wavwrap';

  if(w.avatar){
    var av=document.createElement('div');
    av.className='wav';
    var img=document.createElement('img');
    img.src=w.avatar;
    img.addEventListener('error',function(){
      av.removeChild(img);
      av.className='wav-init';
      av.textContent=initials(w.name);
    });
    av.appendChild(img);
    awrap.appendChild(av);
  }else{
    var av2=document.createElement('div');
    av2.className='wav-init';
    av2.textContent=initials(w.name);
    awrap.appendChild(av2);
  }

  if(w.verified){
    var vb=document.createElement('div');
    vb.className='wvbadge';
    vb.textContent='\u2713';
    awrap.appendChild(vb);
  }
  pin.appendChild(awrap);

  /* rating badge */
  var rt=document.createElement('div');
  rt.className='wrating';
  rt.textContent='\u2605 '+w.rating;
  pin.appendChild(rt);

  /* pointer triangle */
  var ptr=document.createElement('div');
  ptr.className='wptr';
  pin.appendChild(ptr);

  /* ── interactions ── */
  var lastTap=0,tapTimer=null,longTimer=null;

  pin.addEventListener('click',function(e){
    e.stopPropagation();
    var now=Date.now();
    if(now-lastTap<300){
      clearTimeout(tapTimer);
      postRN({type:'openWorkerDetail',workerId:w.id});
      return;
    }
    lastTap=now;
    tapTimer=setTimeout(function(){
      /* single tap → toggle name */
      document.querySelectorAll('.wname.show').forEach(function(el){el.classList.remove('show');});
      nm.classList.add('show');
      setTimeout(function(){nm.classList.remove('show');},2200);
    },280);
  });

  pin.addEventListener('touchstart',function(){
    longTimer=setTimeout(function(){
      postRN({type:'openWorkerDetail',workerId:w.id});
    },650);
  },{passive:true});
  pin.addEventListener('touchend',function(){clearTimeout(longTimer);},{passive:true});
  pin.addEventListener('touchcancel',function(){clearTimeout(longTimer);},{passive:true});

  return pin;
}

function initials(name){
  var parts=(name||'?').trim().split(' ');
  return (parts[parts.length-1]||'?').charAt(0).toUpperCase();
}

/* ── initMap ── */
function initMap(){
  try{
    map=new google.maps.Map(document.getElementById('map'),{
      center:USER,zoom:15,
      disableDefaultUI:true,gestureHandling:'greedy',clickableIcons:false,
      styles:[
        {featureType:'poi',stylers:[{visibility:'off'}]},
        {featureType:'transit',elementType:'labels.icon',stylers:[{visibility:'off'}]}
      ]
    });

    /* radar circle */
    scanCircle=new google.maps.Circle({
      map:map,center:USER,radius:RADIUS,
      strokeColor:'#0D9488',strokeOpacity:0.35,strokeWeight:2,
      fillColor:'#0D9488',fillOpacity:0.07
    });

    /* user dot (centered on position, no anchor-bottom) */
    mkOverlay(new google.maps.LatLng(USER.lat,USER.lng),makeUserDot(),99,false);

    /* scan waves */
    var swrap=makeScanWaves();
    var scanOv=mkOverlay(new google.maps.LatLng(USER.lat,USER.lng),swrap,1,false);
    scanOvs.push(scanOv);

    /* close name popups on map click */
    map.addListener('click',function(){
      document.querySelectorAll('.wname.show').forEach(function(el){el.classList.remove('show');});
    });

    postRN({type:'mapReady'});
  }catch(e){
    postRN({type:'mapError',message:e&&e.message?e.message:'initMap error',stack:e&&e.stack?String(e.stack):''});
  }
}

/* ── Messages from React Native ── */
function handleMsg(raw){
  try{
    var msg=JSON.parse(raw);

    if(msg.type==='finishScan'){
      /* remove scan waves */
      scanOvs.forEach(function(o){o.setMap(null);});
      scanOvs=[];

      /* add worker pins */
      workerOvs.forEach(function(o){o.setMap(null);});
      workerOvs=[];

      var workers=msg.workers||[];
      workers.forEach(function(w){
        var pin=makeWorkerPin(w);
        var ov=mkOverlay(new google.maps.LatLng(w.lat,w.lng),pin,20,true);
        workerOvs.push(ov);
      });

      /* fit map to show all workers */
      if(workers.length){
        var b=new google.maps.LatLngBounds();
        b.extend(USER);
        workers.forEach(function(w){b.extend({lat:w.lat,lng:w.lng});});
        map.fitBounds(b,70);
      }
    }
  }catch(e){
    postRN({type:'mapError',message:'handleMsg error: '+(e&&e.message?e.message:String(e))});
  }
}

document.addEventListener('message',function(e){handleMsg(e.data);});
window.addEventListener('message',function(e){handleMsg(e.data);});
</script>
<script async defer
  src="https://maps.googleapis.com/maps/api/js?key=${apiKey}&callback=initMap"
  onerror="window.ReactNativeWebView&&window.ReactNativeWebView.postMessage(JSON.stringify({type:'mapError',message:'Failed to load Maps script'}))">
</script>
</body></html>`;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function ScanWorkersScreen() {
  const params = useLocalSearchParams<{
    serviceId: string;
    serviceName: string;
    address: string;
    district: string;
    city: string;
    note: string;
    date: string;
    time: string;
  }>();

  // ── Location ────────────────────────────────────────────────────────────────
  const { location } = useUserLocation({ autoStart: true, highAccuracy: true });
  const userLat = location?.latitude ?? 10.7769;
  const userLng = location?.longitude ?? 106.7009;

  // Derive worker type + specialty label from the selected serviceId
  const workerType = serviceIdToWorkerType(params.serviceId);
  const specialtyLabel = serviceIdToLabel(params.serviceId);

  // ── Real nearby workers (falls back to mock when API unavailable) ───────────
  // Pass both `category` (for mock fallback) and `workerType` (for real API)
  // so filtering works regardless of which data source is active.
  const { workers: nearbyWorkers } = useNearbyWorkers(location, {
    category: params.serviceId,
    workerType,
    radiusKm: SCAN_RADIUS_M / 1000,
    limit: 8,
    autoSearch: true,
    refreshInterval: 0,
  });

  // Map WorkerWithLocation → WorkerMapItem (stable, scoped data for the map)
  const workers = useMemo<WorkerMapItem[]>(() => {
    return nearbyWorkers.map(
      (w: WorkerWithLocation): WorkerMapItem => ({
        id: w.id,
        name: w.name,
        avatar: w.avatar ?? "",
        rating: Math.round((w.rating ?? 0) * 10) / 10,
        reviewCount: w.reviewCount ?? 0,
        completedJobs: w.completedJobs ?? 0,
        lat: w.latitude,
        lng: w.longitude,
        distanceKm: w.distance ?? 0,
        estimatedArrival: w.estimatedArrival ?? 15,
        dailyRate: w.dailyRate ?? 0,
        verified: !!w.verified,
        experience: w.experience ?? 0,
        workerType: w.workerType ?? "",
      }),
    );
  }, [nearbyWorkers]);

  // ── Refs & state ─────────────────────────────────────────────────────────────
  const webViewRef = useRef<WebView>(null);
  const scanAnim = useRef(new Animated.Value(0)).current;

  const [mapReady, setMapReady] = useState(false);
  const [foundCount, setFoundCount] = useState(0);
  const [scanning, setScanning] = useState(true);
  const [scanDone, setScanDone] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);

  // ── Stable map HTML (lat/lng only, no worker data embedded) ─────────────────
  const mapHtml = useMemo(
    () => buildMapHtml(userLat, userLng, SCAN_RADIUS_M, GMAPS_KEY),
    [userLat, userLng],
  );

  // ── Rotating icon animation ──────────────────────────────────────────────────
  useEffect(() => {
    const loop = Animated.loop(
      Animated.timing(scanAnim, {
        toValue: 1,
        duration: 2500,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    );
    loop.start();
    return () => loop.stop();
  }, [scanAnim]);

  // ── Scan sequence: count up → send finishScan to WebView ────────────────────
  useEffect(() => {
    if (!mapReady || workers.length === 0) return;

    setScanning(true);
    setScanDone(false);
    setFoundCount(0);

    const total = workers.length;
    let count = 0;

    const interval = setInterval(() => {
      count += 1;
      setFoundCount(count);
      if (count >= total) {
        clearInterval(interval);
        setTimeout(() => {
          webViewRef.current?.postMessage(
            JSON.stringify({ type: "finishScan", workers }),
          );
          setScanning(false);
          setScanDone(true);
        }, 700);
      }
    }, 480);

    return () => clearInterval(interval);
  }, [mapReady, workers]);

  // ── Navigation ───────────────────────────────────────────────────────────────
  const onViewWorkers = useCallback(() => {
    router.push({
      pathname: "/booking/worker-list",
      params: {
        serviceId: params.serviceId,
        serviceName: params.serviceName,
        address: params.address,
        district: params.district,
        city: params.city,
        note: params.note,
        date: params.date,
        time: params.time,
        workerCount: String(foundCount),
      },
    } as Href);
  }, [params, foundCount]);

  // ── WebView messages ─────────────────────────────────────────────────────────
  const onWebViewMessage = useCallback(
    (event: WebViewMessageEvent) => {
      try {
        const data = JSON.parse(event.nativeEvent.data);

        if (data.type === "webLog") {
          console.log("[WebView]", data.message);
          return;
        }

        if (data.type === "mapError") {
          console.warn("[WebView mapError]", data.message, data.stack ?? "");
          setMapError(data.message ?? "Map error");
          return;
        }

        if (data.type === "mapReady") {
          setMapError(null);
          setMapReady(true);
          return;
        }

        if (data.type === "openWorkerDetail") {
          const w = workers.find((x) => x.id === data.workerId);
          if (!w) return;
          router.push({
            pathname: "/booking/worker-detail",
            params: {
              serviceId: params.serviceId,
              serviceName: params.serviceName,
              address: params.address,
              district: params.district,
              city: params.city,
              note: params.note,
              date: params.date,
              time: params.time,
              workerId: w.id,
              workerName: w.name,
              workerRating: String(w.rating),
              workerReviews: String(w.reviewCount),
              workerJobs: String(w.completedJobs),
              workerDistance: String(w.distanceKm),
              workerArrival: String(w.estimatedArrival),
              workerPrice: String(w.dailyRate),
              workerVerified: String(w.verified),
              workerExp: String(w.experience),
              workerSpecialty: w.workerType,
            },
          } as Href);
        }
      } catch (err) {
        console.warn("[WebView parse error]", err);
      }
    },
    [workers, params],
  );

  const rotateInterpolate = scanAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    <View style={s.container}>
      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
          <Ionicons name="arrow-back" size={22} color="#1F2937" />
        </TouchableOpacity>
        <Text style={s.headerTitle}>
          {scanDone ? `Tìm thấy ${foundCount} thợ` : "Đang tìm thợ..."}
        </Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Map */}
      <View style={s.mapArea}>
        <WebView
          ref={webViewRef}
          source={{ html: mapHtml }}
          style={s.webview}
          javaScriptEnabled
          domStorageEnabled
          originWhitelist={["*"]}
          scrollEnabled={false}
          mixedContentMode="always"
          onMessage={onWebViewMessage}
          onError={(e) => setMapError(e.nativeEvent.description)}
          onHttpError={(e) =>
            setMapError(`HTTP ${e.nativeEvent.statusCode}`)
          }
        />

        {!!mapError && (
          <View style={s.errorBox}>
            <Ionicons name="alert-circle" size={16} color="#B91C1C" />
            <Text style={s.errorText} numberOfLines={3}>
              {mapError}
            </Text>
          </View>
        )}
      </View>

      {/* Info panel */}
      <View style={s.panel}>
        {/* Service & address */}
        <View style={s.infoCard}>
          <View style={s.row}>
            <Ionicons name="construct-outline" size={15} color="#0D9488" />
            <Text style={s.infoLabel}>{params.serviceName}</Text>
          </View>
          <View style={s.row}>
            <Ionicons name="location-outline" size={15} color="#0D9488" />
            <Text style={s.infoAddr} numberOfLines={1}>
              {params.address}
            </Text>
          </View>
        </View>

        {/* Scan status */}
        <View style={s.statusRow}>
          {scanning ? (
            <>
              <Animated.View
                style={{ transform: [{ rotate: rotateInterpolate }] }}
              >
                <Ionicons name="radio-outline" size={26} color="#0D9488" />
              </Animated.View>
              <View>
                <Text style={s.scanTxt}>
                  Đang tìm{" "}
                  <Text style={s.scanEmphasis}>{specialtyLabel}</Text>
                  {" "}gần bạn...
                </Text>
                <Text style={s.foundTxt}>Đã quét được {foundCount} thợ</Text>
              </View>
            </>
          ) : (
            <>
              <Ionicons name="checkmark-circle" size={30} color="#10B981" />
              <View style={{ flex: 1 }}>
                <Text style={s.doneTxt}>
                  Tìm thấy {foundCount}{" "}
                  <Text style={s.doneEmphasis}>{specialtyLabel}</Text>
                  {" "}gần bạn!
                </Text>
                <Text style={s.hintTxt}>
                  Chạm để xem tên · Chạm đúp / giữ để xem hồ sơ
                </Text>
              </View>
            </>
          )}
        </View>

        {/* CTA */}
        {scanDone && (
          <TouchableOpacity
            style={s.ctaBtn}
            onPress={onViewWorkers}
            activeOpacity={0.8}
          >
            <Text style={s.ctaTxt}>Xem danh sách thợ</Text>
            <Ionicons name="arrow-forward" size={18} color="#fff" />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: Platform.OS === "ios" ? 56 : 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
    backgroundColor: "#fff",
    zIndex: 10,
  },
  backBtn: { width: 40, height: 40, justifyContent: "center" },
  headerTitle: { fontSize: 17, fontWeight: "700", color: "#1F2937" },

  mapArea: { flex: 1, overflow: "hidden", position: "relative" },
  webview: { flex: 1, backgroundColor: "#EEF6F3" },

  errorBox: {
    position: "absolute",
    left: 12,
    right: 12,
    bottom: 12,
    backgroundColor: "rgba(254,242,242,.96)",
    borderWidth: 1,
    borderColor: "#FECACA",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
  },
  errorText: { flex: 1, color: "#991B1B", fontSize: 12, lineHeight: 18 },

  panel: {
    padding: 16,
    paddingBottom: Platform.OS === "ios" ? 34 : 16,
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    marginTop: -20,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -3 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
      },
      android: { elevation: 8 },
    }),
  },

  infoCard: {
    padding: 12,
    borderRadius: 12,
    backgroundColor: "#F9FAFB",
    marginBottom: 14,
    gap: 8,
  },
  row: { flexDirection: "row", alignItems: "center", gap: 8 },
  infoLabel: { fontSize: 13, fontWeight: "600", color: "#1F2937" },
  infoAddr: { fontSize: 12, color: "#6B7280", flex: 1 },

  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 14,
  },
  scanTxt: { fontSize: 14, fontWeight: "600", color: "#1F2937" },
  scanEmphasis: { color: "#0D9488", fontWeight: "700" },
  foundTxt: { fontSize: 12, color: "#0D9488", marginTop: 2 },
  doneTxt: { fontSize: 15, fontWeight: "700", color: "#1F2937" },
  doneEmphasis: { color: "#0D9488" },
  hintTxt: { fontSize: 11, color: "#6B7280", marginTop: 3 },

  ctaBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#0D9488",
    borderRadius: 14,
    paddingVertical: 16,
    gap: 8,
  },
  ctaTxt: { fontSize: 16, fontWeight: "700", color: "#fff" },
});
