/**
 * Scan Workers Screen — Step 3 of booking flow
 * Real OpenStreetMap + Leaflet radar scanning for nearby workers
 */

import { useUserLocation } from "@/hooks/useUserLocation";
import { Ionicons } from "@expo/vector-icons";
import { Href, router, useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import {
    Animated,
    Easing,
    Platform,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { WebView } from "react-native-webview";

// ─── Worker positions around HCM center ───
const WORKER_OFFSETS = [
  { dLat: 0.008, dLng: 0.012 },
  { dLat: -0.006, dLng: -0.015 },
  { dLat: 0.012, dLng: -0.005 },
  { dLat: -0.01, dLng: 0.008 },
  { dLat: 0.004, dLng: -0.012 },
  { dLat: -0.013, dLng: 0.003 },
  { dLat: 0.009, dLng: 0.009 },
  { dLat: -0.003, dLng: -0.01 },
];

function buildMapHtml(
  lat: number,
  lng: number,
  workers: { lat: number; lng: number }[],
) {
  const workersJson = JSON.stringify(workers);
  return `<!DOCTYPE html>
<html>
<head>
<meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no"/>
<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"/>
<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
<style>
*{margin:0;padding:0;box-sizing:border-box}
html,body,#map{width:100%;height:100%}
.user-marker{width:24px;height:24px;position:relative}
.user-dot{width:16px;height:16px;border-radius:50%;background:#0D9488;border:3px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,.3);position:absolute;top:4px;left:4px;z-index:2}
.user-pulse{width:40px;height:40px;border-radius:50%;background:rgba(13,148,136,.25);position:absolute;top:-8px;left:-8px;animation:pulse 2s infinite}
@keyframes pulse{0%{transform:scale(.5);opacity:.8}100%{transform:scale(2.5);opacity:0}}
.user-label{position:absolute;top:26px;left:50%;transform:translateX(-50%);font:bold 10px/1 sans-serif;color:#0D9488;white-space:nowrap;text-shadow:0 1px 2px #fff}
.worker-marker{width:32px;height:32px;border-radius:50%;background:#FF6B35;display:flex;align-items:center;justify-content:center;box-shadow:0 2px 8px rgba(255,107,53,.4);opacity:0;transform:scale(0);transition:all .5s cubic-bezier(.34,1.56,.64,1)}
.worker-marker.show{opacity:1;transform:scale(1)}
.worker-marker svg{width:16px;height:16px;fill:#fff}
.radar-ring{border:2px solid rgba(13,148,136,.3);border-radius:50%;position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);pointer-events:none}
.radar-pulse{border:2px solid rgba(13,148,136,.5);border-radius:50%;position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);pointer-events:none;animation:radarPulse 3s infinite}
@keyframes radarPulse{0%{width:0;height:0;opacity:.6}100%{width:500px;height:500px;opacity:0}}
.radar-pulse.d1{animation-delay:.8s}
.radar-pulse.d2{animation-delay:1.6s}
</style>
</head>
<body>
<div id="map"></div>
<div class="radar-pulse" id="rp0"></div>
<div class="radar-pulse d1" id="rp1"></div>
<div class="radar-pulse d2" id="rp2"></div>
<script>
var userLat=${lat},userLng=${lng};
var workers=${workersJson};

var map=L.map('map',{zoomControl:false,attributionControl:false}).setView([userLat,userLng],15);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:18}).addTo(map);

// User marker
var userIcon=L.divIcon({className:'',html:'<div class="user-marker"><div class="user-pulse"></div><div class="user-dot"></div><div class="user-label">Bạn</div></div>',iconSize:[24,24],iconAnchor:[12,12]});
L.marker([userLat,userLng],{icon:userIcon,zIndex:1000}).addTo(map);

// Static radar rings
var overlay=document.getElementById('map');
function posRadar(){
  var cp=map.latLngToContainerPoint([userLat,userLng]);
  ['rp0','rp1','rp2'].forEach(function(id){
    var el=document.getElementById(id);
    el.style.top=cp.y+'px';
    el.style.left=cp.x+'px';
  });
}
posRadar();
map.on('move zoom',posRadar);

// Worker markers — appear one by one
var workerSvg='<svg viewBox="0 0 24 24"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>';
var wMarkers=[];
workers.forEach(function(w,i){
  var wIcon=L.divIcon({className:'',html:'<div class="worker-marker" id="wm'+i+'">'+workerSvg+'</div>',iconSize:[32,32],iconAnchor:[16,16]});
  var m=L.marker([w.lat,w.lng],{icon:wIcon}).addTo(map);
  wMarkers.push(m);
});

// Reveal workers one by one
function revealWorker(idx){
  var el=document.getElementById('wm'+idx);
  if(el)el.classList.add('show');
}

// Listen for messages from RN
document.addEventListener('message',function(e){
  try{
    var d=JSON.parse(e.data);
    if(d.type==='reveal')revealWorker(d.index);
    if(d.type==='updateCenter'){
      map.setView([d.lat,d.lng],15);
    }
  }catch(ex){}
});
window.addEventListener('message',function(e){
  try{
    var d=JSON.parse(e.data);
    if(d.type==='reveal')revealWorker(d.index);
  }catch(ex){}
});
</script>
</body>
</html>`;
}

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

  const { location } = useUserLocation({ autoStart: true, highAccuracy: true });
  const userLat = location?.latitude ?? 10.7769;
  const userLng = location?.longitude ?? 106.7009;

  const [foundCount, setFoundCount] = useState(0);
  const [scanning, setScanning] = useState(true);
  const [scanDone, setScanDone] = useState(false);

  const webViewRef = useRef<WebView>(null);
  const scanAnim = useRef(new Animated.Value(0)).current;

  // Workers positioned around user
  const workers = WORKER_OFFSETS.map((o) => ({
    lat: userLat + o.dLat + (Math.random() - 0.5) * 0.002,
    lng: userLng + o.dLng + (Math.random() - 0.5) * 0.002,
  }));

  // Scanning animation (for the icon in info area)
  useEffect(() => {
    Animated.loop(
      Animated.timing(scanAnim, {
        toValue: 1,
        duration: 3000,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    ).start();
  }, [scanAnim]);

  // Simulate finding workers one by one
  useEffect(() => {
    const totalWorkers = 6 + Math.floor(Math.random() * 3);
    let count = 0;
    const interval = setInterval(() => {
      count++;
      setFoundCount(count);
      // Reveal worker on real map
      webViewRef.current?.postMessage(
        JSON.stringify({ type: "reveal", index: count - 1 }),
      );
      if (count >= totalWorkers) {
        clearInterval(interval);
        setTimeout(() => {
          setScanning(false);
          setScanDone(true);
        }, 800);
      }
    }, 600);

    return () => clearInterval(interval);
  }, []);

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

  const rotateInterpolate = scanAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  const mapHtml = buildMapHtml(userLat, userLng, workers);

  return (
    <View style={s.container}>
      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
          <Ionicons name="arrow-back" size={22} color="#1F2937" />
        </TouchableOpacity>
        <Text style={s.headerTitle}>Đang tìm thợ...</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Real map area */}
      <View style={s.mapArea}>
        <WebView
          ref={webViewRef}
          source={{ html: mapHtml }}
          style={s.webview}
          scrollEnabled={false}
          javaScriptEnabled
          originWhitelist={["*"]}
          showsHorizontalScrollIndicator={false}
          showsVerticalScrollIndicator={false}
        />
      </View>

      {/* Info area */}
      <View style={s.infoArea}>
        {/* Service & address info */}
        <View style={s.infoCard}>
          <View style={s.infoRow}>
            <Ionicons name="construct-outline" size={16} color="#0D9488" />
            <Text style={s.infoLabel}>{params.serviceName}</Text>
          </View>
          <View style={s.infoRow}>
            <Ionicons name="location-outline" size={16} color="#0D9488" />
            <Text style={s.infoAddr} numberOfLines={1}>
              {params.address}
            </Text>
          </View>
        </View>

        {/* Found count */}
        <View style={s.countArea}>
          {scanning ? (
            <View style={s.scanningRow}>
              <Animated.View
                style={[
                  s.scanDot,
                  {
                    transform: [
                      {
                        rotate: rotateInterpolate,
                      },
                    ],
                  },
                ]}
              >
                <Ionicons name="radio-outline" size={24} color="#0D9488" />
              </Animated.View>
              <View>
                <Text style={s.scanText}>Đang quét thợ gần bạn...</Text>
                <Text style={s.foundText}>Đã tìm thấy {foundCount} thợ</Text>
              </View>
            </View>
          ) : (
            <View style={s.doneRow}>
              <View style={s.doneBadge}>
                <Ionicons name="checkmark-circle" size={24} color="#10B981" />
              </View>
              <View>
                <Text style={s.doneTitle}>
                  Tìm thấy {foundCount} thợ gần bạn!
                </Text>
                <Text style={s.doneSubtitle}>
                  Chọn thợ phù hợp nhất cho bạn
                </Text>
              </View>
            </View>
          )}
        </View>

        {/* CTA */}
        {scanDone && (
          <TouchableOpacity
            style={s.ctaBtn}
            onPress={onViewWorkers}
            activeOpacity={0.8}
          >
            <Text style={s.ctaText}>Xem danh sách thợ</Text>
            <Ionicons name="arrow-forward" size={18} color="#fff" />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

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

  // Map area — real WebView
  mapArea: {
    flex: 1,
    overflow: "hidden",
    position: "relative",
  },
  webview: {
    flex: 1,
    backgroundColor: "#F0FDF9",
  },

  // Info area
  infoArea: {
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
    marginBottom: 16,
    gap: 8,
  },
  infoRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  infoLabel: { fontSize: 13, fontWeight: "600", color: "#1F2937" },
  infoAddr: { fontSize: 12, color: "#6B7280", flex: 1 },

  countArea: {
    marginBottom: 16,
  },
  scanningRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  scanDot: {},
  scanText: { fontSize: 14, fontWeight: "600", color: "#1F2937" },
  foundText: { fontSize: 12, color: "#0D9488", marginTop: 2 },

  doneRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  doneBadge: {},
  doneTitle: { fontSize: 16, fontWeight: "700", color: "#1F2937" },
  doneSubtitle: { fontSize: 12, color: "#6B7280", marginTop: 2 },

  ctaBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#0D9488",
    borderRadius: 14,
    paddingVertical: 16,
    gap: 8,
  },
  ctaText: { fontSize: 16, fontWeight: "700", color: "#fff" },
});
