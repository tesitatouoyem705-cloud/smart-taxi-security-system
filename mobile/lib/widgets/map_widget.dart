import 'package:flutter/material.dart';
import 'package:flutter_map/flutter_map.dart';
import 'package:latlong2/latlong.dart';
import 'package:smart_taxi_security/constants/app_icons.dart';
import '../constants/app_colors.dart';
import '../models/taxi_model.dart';

class MapWidget extends StatefulWidget {
  final LatLng center;
  final double zoom;
  final LatLng? pickupLocation;
  final LatLng? dropoffLocation;
  final LatLng? vehicleLocation;
  final LatLng? userLocation;
  final List<TaxiModel> nearbyTaxis;
  final bool isSosActive;
  final Function(LatLng)? onTap;
  final double? bottomPadding;
  final double? topPadding;

  const MapWidget({
    super.key,
    required this.center,
    this.zoom = 14.0,
    this.pickupLocation,
    this.dropoffLocation,
    this.vehicleLocation,
    this.userLocation,
    this.nearbyTaxis = const [],
    this.isSosActive = false,
    this.onTap,
    this.bottomPadding,
    this.topPadding,
  });

  @override
  State<MapWidget> createState() => _MapWidgetState();
}

class _MapWidgetState extends State<MapWidget> {
  final MapController _mapController = MapController();
  bool _godsEyeMode = true;
  String _selectedRegion = 'CMR'; // 'CMR' for Cameroon (Yaoundé), 'US' for USA (New York)

  static const List<Map<String, dynamic>> usCameras = [
    {
      'id': 'CAM-US-01',
      'name': 'Times Square & Broadway 42nd St',
      'lat': 40.7580,
      'lng': -73.9855,
      'region': 'US',
      'city': 'New York, USA',
      'resolution': '4K UHD 60fps',
      'target': 'PEDESTRIANS: 28 | VEHICLES: 19',
      'status': 'ONLINE 4K'
    },
    {
      'id': 'CAM-US-02',
      'name': '5th Avenue & Central Park South',
      'lat': 40.7648,
      'lng': -73.9735,
      'region': 'US',
      'city': 'New York, USA',
      'resolution': '4K HDR',
      'target': 'DIPLOMATIC CONVOY CORRIDOR',
      'status': 'ONLINE 4K'
    },
    {
      'id': 'CAM-US-03',
      'name': 'Grand Central Terminal & Park Ave',
      'lat': 40.7527,
      'lng': -73.9772,
      'region': 'US',
      'city': 'New York, USA',
      'resolution': '1080p 60fps',
      'target': 'SUBWAY TRANSIT ARTERIAL',
      'status': 'ONLINE 4K'
    },
    {
      'id': 'CAM-US-04',
      'name': 'Brooklyn Bridge Approach & FDR',
      'lat': 40.7128,
      'lng': -73.9969,
      'region': 'US',
      'city': 'New York, USA',
      'resolution': '4K 60fps',
      'target': 'HIGHWAY RADAR: CLEAR',
      'status': 'ONLINE 4K'
    },
    {
      'id': 'CAM-US-05',
      'name': 'Columbus Circle & 8th Avenue',
      'lat': 40.7681,
      'lng': -73.9819,
      'region': 'US',
      'city': 'New York, USA',
      'resolution': '4K FLIR Dual-Spectrum',
      'target': 'CIRCULAR PERIMETER CLEAR',
      'status': 'ONLINE 4K'
    },
    {
      'id': 'CAM-US-06',
      'name': 'Wall Street & Broadway Financial Grid',
      'lat': 40.7071,
      'lng': -74.0110,
      'region': 'US',
      'city': 'New York, USA',
      'resolution': '4K Thermal Matrix',
      'target': 'FINANCIAL SECTOR SECURE',
      'status': 'ONLINE 4K'
    },
  ];

  static const List<Map<String, dynamic>> cameroonCameras = [
    {
      'id': 'CAM-CMR-01',
      'name': 'God\'s Eye HD Optical - Odza & Messamendongo Axis',
      'lat': 3.8150,
      'lng': 11.5590,
      'region': 'CMR',
      'city': 'Odza, Yaoundé',
      'resolution': '4K UHD 60fps',
      'target': 'LOCAL SECTOR: 100% CLEAR',
      'status': 'ONLINE 4K'
    },
    {
      'id': 'CAM-US-01',
      'name': 'US Diplomatic Security - Bastos Embassy Sector',
      'lat': 3.8910,
      'lng': 11.5130,
      'region': 'CMR',
      'city': 'Yaoundé, Cameroon',
      'resolution': '4K Ultra HD',
      'target': 'EMBASSY CORRIDOR: 100% SECURE',
      'status': 'ONLINE 4K'
    },
    {
      'id': 'CAM-US-02',
      'name': 'Times-Grade 4K Matrix - Poste Centrale & Blvd 20 Mai',
      'lat': 3.8667,
      'lng': 11.5167,
      'region': 'CMR',
      'city': 'Yaoundé, Cameroon',
      'resolution': '4K UHD 60fps',
      'target': 'TRANSIT DENSITY: MODERATE',
      'status': 'ONLINE 4K'
    },
    {
      'id': 'CAM-US-03',
      'name': 'US Spec AI Recon - Rond-Point Nlongkak',
      'lat': 3.8820,
      'lng': 11.5210,
      'region': 'CMR',
      'city': 'Yaoundé, Cameroon',
      'resolution': '1080p 60fps',
      'target': 'FLEET TRACKING LOCKED',
      'status': 'ONLINE 4K'
    },
    {
      'id': 'CAM-US-04',
      'name': 'FLIR Thermal Recon - Stade Omnisports Mfandena',
      'lat': 3.8780,
      'lng': 11.5360,
      'region': 'CMR',
      'city': 'Yaoundé, Cameroon',
      'resolution': '4K HDR',
      'target': 'STADIUM PERIMETER MONITORED',
      'status': 'ONLINE 4K'
    },
    {
      'id': 'CAM-US-05',
      'name': 'Rapid Optical Intercept - Warda & Education Sector',
      'lat': 3.8580,
      'lng': 11.5050,
      'region': 'CMR',
      'city': 'Yaoundé, Cameroon',
      'resolution': '4K FLIR Dual-Spectrum',
      'target': 'AI NIGHT VISION SCAN',
      'status': 'ONLINE 4K'
    },
    {
      'id': 'CAM-US-06',
      'name': 'Perimeter Shield - Mokolo Commercial Arterial',
      'lat': 3.8625,
      'lng': 11.5245,
      'region': 'CMR',
      'city': 'Yaoundé, Cameroon',
      'resolution': '4K Thermal Matrix',
      'target': 'COMMERCIAL GRID VERIFIED',
      'status': 'ONLINE 4K'
    },
  ];

  // User's verified exact coordinates: 3°48'49.9"N 11°33'28.2"E (Odza / Yaoundé, Cameroon)
  static const LatLng exactUserCameroon = LatLng(3.813861, 11.557833);

  bool _isInsideCameroon(LatLng loc) {
    return loc.latitude >= 1.5 && loc.latitude <= 13.5 &&
           loc.longitude >= 8.0 && loc.longitude <= 16.5;
  }

  LatLng get _effectiveUserLocation {
    if (_selectedRegion == 'CMR') {
      if (widget.userLocation != null && _isInsideCameroon(widget.userLocation!)) {
        return widget.userLocation!;
      }
      return exactUserCameroon;
    } else {
      if (widget.userLocation != null && !_isInsideCameroon(widget.userLocation!)) {
        return widget.userLocation!;
      }
      return const LatLng(40.7580, -73.9855);
    }
  }

  @override
  void didUpdateWidget(covariant MapWidget oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (widget.userLocation != null &&
        (oldWidget.userLocation?.latitude != widget.userLocation?.latitude ||
         oldWidget.userLocation?.longitude != widget.userLocation?.longitude)) {
      final isCam = _isInsideCameroon(widget.userLocation!);
      if (_selectedRegion == 'CMR' && isCam) {
        _mapController.move(widget.userLocation!, _mapController.camera.zoom);
      } else if (_selectedRegion == 'US' && !isCam) {
        _mapController.move(widget.userLocation!, _mapController.camera.zoom);
      }
    } else if (widget.vehicleLocation != null &&
        (oldWidget.vehicleLocation?.latitude != widget.vehicleLocation?.latitude ||
         oldWidget.vehicleLocation?.longitude != widget.vehicleLocation?.longitude)) {
      _mapController.move(widget.vehicleLocation!, _mapController.camera.zoom);
    }
  }

  void _toggleGodsEye() {
    setState(() {
      _godsEyeMode = !_godsEyeMode;
    });
  }

  void _switchRegion(String region) {
    setState(() {
      _selectedRegion = region;
    });
    if (region == 'CMR') {
      final target = (widget.userLocation != null && _isInsideCameroon(widget.userLocation!))
          ? widget.userLocation!
          : exactUserCameroon;
      _mapController.move(target, 15.0);
    } else {
      final target = (widget.userLocation != null && !_isInsideCameroon(widget.userLocation!))
          ? widget.userLocation!
          : const LatLng(40.7580, -73.9855);
      _mapController.move(target, 14.5);
    }
  }

  void _showCCTVModal(Map<String, dynamic> initialCam) {
    Map<String, dynamic> activeCam = initialCam;
    bool isThermalMode = false;
    bool isAudioActive = true;

    showModalBottomSheet(
      context: context,
      backgroundColor: Colors.transparent,
      isScrollControlled: true,
      builder: (ctx) => StatefulBuilder(
        builder: (modalContext, setModalState) {
          return Container(
            padding: const EdgeInsets.all(20),
            decoration: const BoxDecoration(
              color: Color(0xFF090918),
              borderRadius: BorderRadius.vertical(top: Radius.circular(28)),
              border: Border(top: BorderSide(color: Color(0xFF00D4FF), width: 2.2)),
            ),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Center(
                  child: Container(
                    width: 44,
                    height: 4,
                    decoration: BoxDecoration(
                      color: Colors.white24,
                      borderRadius: BorderRadius.circular(2),
                    ),
                  ),
                ),
                const SizedBox(height: 14),

                // Top Feed Title & Badges
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Row(
                      children: [
                        const Icon(Icons.videocam, color: Color(0xFF00D4FF), size: 22),
                        const SizedBox(width: 8),
                        Text(
                          "GOD'S EYE: ${activeCam['id']}",
                          style: const TextStyle(
                            color: Colors.white,
                            fontWeight: FontWeight.w900,
                            fontSize: 14,
                            letterSpacing: 0.8,
                          ),
                        ),
                      ],
                    ),
                    Row(
                      children: [
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                          decoration: BoxDecoration(
                            color: const Color(0x3300D4FF),
                            borderRadius: BorderRadius.circular(8),
                            border: Border.all(color: const Color(0xFF00D4FF)),
                          ),
                          child: Text(
                            activeCam['city'] ?? "SURVEILLANCE",
                            style: const TextStyle(color: Color(0xFF00D4FF), fontSize: 10, fontWeight: FontWeight.w800),
                          ),
                        ),
                        const SizedBox(width: 6),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                          decoration: BoxDecoration(
                            color: const Color(0x3310B981),
                            borderRadius: BorderRadius.circular(8),
                            border: Border.all(color: const Color(0xFF10B981)),
                          ),
                          child: const Text("LIVE 4K", style: TextStyle(color: Color(0xFF10B981), fontSize: 10, fontWeight: FontWeight.bold)),
                        ),
                      ],
                    ),
                  ],
                ),
                const SizedBox(height: 4),
                Text(
                  activeCam['name'] as String,
                  style: const TextStyle(color: Colors.white70, fontSize: 12),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
                const SizedBox(height: 12),

                // Quick Camera Channel Selector Tabs (Scrollable across US & Cameroon)
                SingleChildScrollView(
                  scrollDirection: Axis.horizontal,
                  child: Row(
                    children: [
                      // US Camera Feeds
                      ...usCameras.map((c) {
                        final isSel = activeCam['name'] == c['name'];
                        return Padding(
                          padding: const EdgeInsets.only(right: 6),
                          child: ChoiceChip(
                            label: Text(
                              "🇺🇸 ${c['id']} (${c['name'].split('&')[0].trim()})",
                              style: TextStyle(
                                fontSize: 10,
                                fontWeight: FontWeight.bold,
                                color: isSel ? Colors.black : Colors.white70,
                              ),
                            ),
                            selected: isSel,
                            selectedColor: const Color(0xFF00D4FF),
                            backgroundColor: Colors.white10,
                            padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                            onSelected: (val) {
                              if (val) {
                                setModalState(() => activeCam = c);
                              }
                            },
                          ),
                        );
                      }),
                      // Cameroon Feeds
                      ...cameroonCameras.map((c) {
                        final isSel = activeCam['name'] == c['name'];
                        return Padding(
                          padding: const EdgeInsets.only(right: 6),
                          child: ChoiceChip(
                            label: Text(
                              "🇨🇲 ${c['id']} (${c['name'].split('-')[0].trim()})",
                              style: TextStyle(
                                fontSize: 10,
                                fontWeight: FontWeight.bold,
                                color: isSel ? Colors.black : Colors.white70,
                              ),
                            ),
                            selected: isSel,
                            selectedColor: const Color(0xFF10B981),
                            backgroundColor: Colors.white10,
                            padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                            onSelected: (val) {
                              if (val) {
                                setModalState(() => activeCam = c);
                              }
                            },
                          ),
                        );
                      }),
                    ],
                  ),
                ),
                const SizedBox(height: 12),

                // LIVE HIGH-TECH CAMERA SCREEN WITH ANIMATED RETICLE
                Container(
                  height: 195,
                  width: double.infinity,
                  decoration: BoxDecoration(
                    color: isThermalMode ? const Color(0xFF031A24) : const Color(0xFF02170D),
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(
                      color: isThermalMode ? const Color(0xFF00D4FF) : const Color(0xFF10B981),
                      width: 1.5,
                    ),
                    boxShadow: [
                      BoxShadow(
                        color: isThermalMode ? const Color(0x5500D4FF) : const Color(0x4410B981),
                        blurRadius: 16,
                      ),
                    ],
                  ),
                  child: Stack(
                    children: [
                      // Scanline / Grid Pattern
                      Positioned.fill(
                        child: CustomPaint(
                          painter: _GridPainter(isThermal: isThermalMode),
                        ),
                      ),

                      // Animated AI Vehicle Reticle in Center
                      Center(
                        child: Container(
                          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
                          decoration: BoxDecoration(
                            color: Colors.black.withOpacity(0.65),
                            borderRadius: BorderRadius.circular(12),
                            border: Border.all(
                              color: isThermalMode ? const Color(0xFF00D4FF) : const Color(0xFF10B981),
                              width: 1.2,
                            ),
                          ),
                          child: Column(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              Row(
                                mainAxisSize: MainAxisSize.min,
                                children: [
                                  Container(
                                    width: 8,
                                    height: 8,
                                    decoration: BoxDecoration(
                                      shape: BoxShape.circle,
                                      color: isThermalMode ? const Color(0xFF00D4FF) : const Color(0xFF10B981),
                                    ),
                                  ),
                                  const SizedBox(width: 6),
                                  Text(
                                    "[AI RECON: RETICLE LOCKED]",
                                    style: TextStyle(
                                      color: isThermalMode ? const Color(0xFF00D4FF) : const Color(0xFF10B981),
                                      fontSize: 11,
                                      fontWeight: FontWeight.w900,
                                      fontFamily: 'monospace',
                                    ),
                                  ),
                                ],
                              ),
                              const SizedBox(height: 6),
                              Text(
                                activeCam['target'] as String,
                                style: const TextStyle(color: Colors.white, fontSize: 10, fontWeight: FontWeight.bold),
                              ),
                              const SizedBox(height: 2),
                              const Text(
                                "SECTOR INTERCEPT PROBABILITY: 99.8%",
                                style: TextStyle(color: Colors.white70, fontSize: 9, fontFamily: 'monospace'),
                              ),
                            ],
                          ),
                        ),
                      ),

                      // Top Left Overlay: REC + FPS
                      Positioned(
                        top: 10,
                        left: 12,
                        child: Row(
                          children: [
                            Container(
                              width: 8,
                              height: 8,
                              decoration: const BoxDecoration(shape: BoxShape.circle, color: Colors.redAccent),
                            ),
                            const SizedBox(width: 6),
                            const Text(
                              "REC ● 60 FPS • 4K ULTRA HD",
                              style: TextStyle(
                                color: Colors.white,
                                fontSize: 10,
                                fontFamily: 'monospace',
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                          ],
                        ),
                      ),

                      // Top Right Overlay: Resolution
                      Positioned(
                        top: 10,
                        right: 12,
                        child: Text(
                          activeCam['resolution'] as String,
                          style: const TextStyle(
                            color: Color(0xFF00D4FF),
                            fontSize: 10,
                            fontFamily: 'monospace',
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ),

                      // Bottom Left Overlay: Mode
                      Positioned(
                        bottom: 10,
                        left: 12,
                        child: Text(
                          isThermalMode ? "SPECTRUM: FLIR THERMAL MATRIX" : "SPECTRUM: OPTICAL NIGHT VISION",
                          style: TextStyle(
                            color: isThermalMode ? const Color(0xFF00D4FF) : const Color(0xFF10B981),
                            fontSize: 9,
                            fontFamily: 'monospace',
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ),

                      // Bottom Right Overlay: Audio
                      if (isAudioActive)
                        Positioned(
                          bottom: 10,
                          right: 12,
                          child: const Row(
                            children: [
                              Icon(Icons.graphic_eq, color: Color(0xFF10B981), size: 14),
                              SizedBox(width: 4),
                              Text(
                                "AUDIO INTERCEPT: ON",
                                style: TextStyle(
                                  color: Color(0xFF10B981),
                                  fontSize: 9,
                                  fontFamily: 'monospace',
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                            ],
                          ),
                        ),
                    ],
                  ),
                ),
                const SizedBox(height: 12),

                // Controls Row: Thermal Toggle, Audio Toggle, Relay
                Row(
                  children: [
                    // Thermal toggle
                    OutlinedButton.icon(
                      onPressed: () => setModalState(() => isThermalMode = !isThermalMode),
                      icon: Icon(
                        isThermalMode ? Icons.remove_red_eye : Icons.wb_iridescent,
                        size: 15,
                        color: isThermalMode ? const Color(0xFF00D4FF) : Colors.white70,
                      ),
                      label: Text(
                        isThermalMode ? "FLIR Thermal" : "Night Vision",
                        style: TextStyle(
                          fontSize: 11,
                          color: isThermalMode ? const Color(0xFF00D4FF) : Colors.white70,
                        ),
                      ),
                      style: OutlinedButton.styleFrom(
                        side: BorderSide(
                          color: isThermalMode ? const Color(0xFF00D4FF) : Colors.white24,
                        ),
                        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 10),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                      ),
                    ),
                    const SizedBox(width: 8),

                    // Audio Toggle
                    OutlinedButton.icon(
                      onPressed: () => setModalState(() => isAudioActive = !isAudioActive),
                      icon: Icon(
                        isAudioActive ? Icons.volume_up : Icons.volume_off,
                        size: 15,
                        color: isAudioActive ? const Color(0xFF10B981) : Colors.white38,
                      ),
                      label: Text(
                        isAudioActive ? "Audio Live" : "Muted",
                        style: TextStyle(
                          fontSize: 11,
                          color: isAudioActive ? const Color(0xFF10B981) : Colors.white38,
                        ),
                      ),
                      style: OutlinedButton.styleFrom(
                        side: BorderSide(
                          color: isAudioActive ? const Color(0xFF10B981) : Colors.white24,
                        ),
                        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 10),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                      ),
                    ),
                    const Spacer(),

                    // Close Button
                    IconButton(
                      icon: const Icon(Icons.close, color: Colors.white60),
                      onPressed: () => Navigator.pop(ctx),
                    ),
                  ],
                ),
                const SizedBox(height: 8),

                // Primary Action: Relay to Dispatch
                SizedBox(
                  width: double.infinity,
                  child: ElevatedButton.icon(
                    onPressed: () {
                      Navigator.pop(ctx);
                      ScaffoldMessenger.of(context).showSnackBar(
                        SnackBar(
                          content: Text("🚨 Relayed live ${activeCam['id']} (${activeCam['name']}) evidence to Police & Safety Dispatch!"),
                          backgroundColor: const Color(0xFF00D4FF),
                          behavior: SnackBarBehavior.floating,
                        ),
                      );
                    },
                    icon: const Icon(Icons.shield, size: 16),
                    label: Text(
                      "Relay Live Feed (${activeCam['id']}) to Dispatch",
                      style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w800),
                    ),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xFF00D4FF),
                      foregroundColor: Colors.black,
                      padding: const EdgeInsets.symmetric(vertical: 12),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                    ),
                  ),
                ),
              ],
            ),
          );
        },
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    // Build Markers List
    final List<Marker> markers = [];

    // Active surveillance camera grid based on selected region (Cameroon vs US)
    final activeCams = _selectedRegion == 'US' ? usCameras : cameroonCameras;

    if (_godsEyeMode) {
      for (var cam in activeCams) {
        markers.add(
          Marker(
            point: LatLng(cam['lat'] as double, cam['lng'] as double),
            width: 38,
            height: 38,
            child: GestureDetector(
              onTap: () => _showCCTVModal(cam),
              child: Container(
                decoration: BoxDecoration(
                  color: const Color(0xFF090918),
                  shape: BoxShape.circle,
                  border: Border.all(color: const Color(0xFF00D4FF), width: 2),
                  boxShadow: const [
                    BoxShadow(color: Color(0x7700D4FF), blurRadius: 10),
                  ],
                ),
                child: const Icon(Icons.videocam, color: Color(0xFF00D4FF), size: 19),
              ),
            ),
          ),
        );
      }
    }

    // 0. User's Live Position Marker (GPS) - Adapts to Cameroon and US maps
    final userPos = _effectiveUserLocation;
    final isCameroon = _selectedRegion == 'CMR';

    markers.add(
      Marker(
        point: userPos,
        width: 80,
        height: 80,
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2.5),
              decoration: BoxDecoration(
                color: const Color(0xEE0A0A1C),
                borderRadius: BorderRadius.circular(6),
                border: Border.all(
                  color: isCameroon ? const Color(0xFF10B981) : const Color(0xFF00D4FF),
                  width: 1.4,
                ),
                boxShadow: [
                  BoxShadow(
                    color: (isCameroon ? const Color(0xFF10B981) : const Color(0xFF00D4FF)).withOpacity(0.5),
                    blurRadius: 8,
                  ),
                ],
              ),
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Icon(
                    Icons.gps_fixed,
                    color: isCameroon ? const Color(0xFF10B981) : const Color(0xFF00D4FF),
                    size: 11,
                  ),
                  const SizedBox(width: 4),
                  Text(
                    isCameroon
                        ? "YOU (3°48'50\"N 11°33'28\"E)"
                        : "YOU (US GPS)",
                    style: const TextStyle(
                      color: Colors.white,
                      fontSize: 8.5,
                      fontWeight: FontWeight.w900,
                      letterSpacing: 0.4,
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 3),
            Stack(
              alignment: Alignment.center,
              children: [
                // Outer radar pulse aura
                Container(
                  width: 38,
                  height: 38,
                  decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    color: (isCameroon ? const Color(0xFF10B981) : const Color(0xFF00D4FF)).withOpacity(0.25),
                    border: Border.all(
                      color: (isCameroon ? const Color(0xFF10B981) : const Color(0xFF00D4FF)).withOpacity(0.8),
                      width: 1.8,
                    ),
                  ),
                ),
                // Core GPS beacon
                Container(
                  width: 18,
                  height: 18,
                  decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    color: isCameroon ? const Color(0xFF10B981) : const Color(0xFF00D4FF),
                    border: Border.all(color: Colors.white, width: 2.5),
                    boxShadow: [
                      BoxShadow(
                        color: isCameroon ? const Color(0xFF10B981) : const Color(0xFF00D4FF),
                        blurRadius: 10,
                        spreadRadius: 2,
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );

    // 1. Nearby Taxis
    for (var taxi in widget.nearbyTaxis) {
      markers.add(
        Marker(
          point: LatLng(taxi.currentLatitude, taxi.currentLongitude),
          width: 44,
          height: 44,
          child: Container(
            decoration: BoxDecoration(
              color: AppColors.taxiYellow,
              shape: BoxShape.circle,
              border: Border.all(color: Colors.black87, width: 2),
              boxShadow: const [
                BoxShadow(color: Colors.black38, blurRadius: 6, offset: Offset(0, 3)),
              ],
            ),
            child: const Icon(LucideIcons.car, color: Colors.black87, size: 22),
          ),
        ),
      );
    }

    // 2. Pickup Location Marker
    if (widget.pickupLocation != null) {
      markers.add(
        Marker(
          point: widget.pickupLocation!,
          width: 44,
          height: 44,
          child: Container(
            decoration: BoxDecoration(
              color: AppColors.primary,
              shape: BoxShape.circle,
              border: Border.all(color: Colors.white, width: 2),
              boxShadow: const [
                BoxShadow(color: Colors.black38, blurRadius: 6, offset: Offset(0, 3)),
              ],
            ),
            child: const Icon(LucideIcons.circleDot, color: Colors.white, size: 22),
          ),
        ),
      );
    }

    // 3. Dropoff Location Marker
    if (widget.dropoffLocation != null) {
      markers.add(
        Marker(
          point: widget.dropoffLocation!,
          width: 44,
          height: 44,
          child: Container(
            decoration: BoxDecoration(
              color: AppColors.sosRed,
              shape: BoxShape.circle,
              border: Border.all(color: Colors.white, width: 2),
              boxShadow: const [
                BoxShadow(color: Colors.black38, blurRadius: 6, offset: Offset(0, 3)),
              ],
            ),
            child: const Icon(LucideIcons.mapPin, color: Colors.white, size: 22),
          ),
        ),
      );
    }

    // 4. Live Vehicle Location Marker (Only when vehicleLocation is provided)
    if (widget.vehicleLocation != null) {
      markers.add(
        Marker(
          point: widget.vehicleLocation!,
          width: 52,
          height: 52,
          child: Container(
            decoration: BoxDecoration(
              color: widget.isSosActive ? AppColors.sosRed : AppColors.primary,
              shape: BoxShape.circle,
              border: Border.all(color: Colors.white, width: 3),
              boxShadow: [
                BoxShadow(
                  color: widget.isSosActive ? AppColors.sosGlow : AppColors.primary.withOpacity(0.4),
                  blurRadius: 12,
                  spreadRadius: 3,
                ),
              ],
            ),
            child: Icon(
              widget.isSosActive ? LucideIcons.alertTriangle : LucideIcons.navigation,
              color: Colors.white,
              size: 26,
            ),
          ),
        ),
      );
    }

    // Build Polylines
    final List<Polyline> polylines = [];
    if (widget.pickupLocation != null && widget.dropoffLocation != null) {
      polylines.add(
        Polyline(
          points: [
            widget.pickupLocation!,
            if (widget.vehicleLocation != null) widget.vehicleLocation!,
            widget.dropoffLocation!,
          ],
          strokeWidth: 4.5,
          color: widget.isSosActive ? AppColors.sosRed : AppColors.primary,
        ),
      );
    }

    return ClipRRect(
      child: Stack(
        children: [
          FlutterMap(
            mapController: _mapController,
            options: MapOptions(
              initialCenter: widget.center,
              initialZoom: widget.zoom,
              onTap: (tapPosition, point) {
                if (widget.onTap != null) widget.onTap!(point);
              },
            ),
            children: [
              TileLayer(
                key: ValueKey('tile_layer_${_godsEyeMode}_$isDark'),
                urlTemplate: _godsEyeMode
                    ? 'https://mt{s}.google.com/vt/lyrs=y&x={x}&y={y}&z={z}'
                    : (isDark
                        ? 'https://cartodb-basemaps-{s}.global.ssl.fastly.net/dark_all/{z}/{x}/{y}.png'
                        : 'https://tile.openstreetmap.org/{z}/{x}/{y}.png'),
                subdomains: _godsEyeMode ? const ['0', '1', '2', '3'] : const ['a', 'b', 'c'],
                maxZoom: 20,
              ),
              if (polylines.isNotEmpty) PolylineLayer(polylines: polylines),
              MarkerLayer(markers: markers),
            ],
          ),

          // God's Eye Tactical Status Banner at Top
          if (_godsEyeMode)
            Positioned(
              top: widget.topPadding ?? 14,
              left: 12,
              right: 12,
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 7),
                decoration: BoxDecoration(
                  color: const Color(0xEE0A0A1C),
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: const Color(0xFF00D4FF), width: 1.2),
                  boxShadow: const [
                    BoxShadow(color: Color(0x6600D4FF), blurRadius: 14),
                  ],
                ),
                child: Row(
                  children: [
                    const Icon(LucideIcons.globe, color: Color(0xFF00D4FF), size: 16),
                    const SizedBox(width: 8),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          const Text(
                            "GOD'S EYE SATELLITE RECON ACTIVE",
                            style: TextStyle(
                              color: Colors.white,
                              fontSize: 9,
                              fontWeight: FontWeight.w900,
                              letterSpacing: 0.5,
                            ),
                          ),
                          Text(
                            _selectedRegion == 'CMR'
                                ? "🇨🇲 YAOUNDÉ CAMEROON • YOU: ${_effectiveUserLocation.latitude.toStringAsFixed(4)}, ${_effectiveUserLocation.longitude.toStringAsFixed(4)}"
                                : "🇺🇸 NEW YORK CITY • YOU: ${_effectiveUserLocation.latitude.toStringAsFixed(4)}, ${_effectiveUserLocation.longitude.toStringAsFixed(4)}",
                            style: const TextStyle(
                              color: Color(0xFF00D4FF),
                              fontSize: 8.5,
                              fontWeight: FontWeight.w700,
                              fontFamily: 'monospace',
                            ),
                          ),
                        ],
                      ),
                    ),

                    // Region Selector: Cameroon vs US
                    InkWell(
                      onTap: () => _switchRegion(_selectedRegion == 'CMR' ? 'US' : 'CMR'),
                      borderRadius: BorderRadius.circular(8),
                      child: Container(
                        padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 4),
                        decoration: BoxDecoration(
                          color: Colors.white12,
                          borderRadius: BorderRadius.circular(8),
                          border: Border.all(color: const Color(0xFF00D4FF).withOpacity(0.5)),
                        ),
                        child: Text(
                          _selectedRegion == 'CMR' ? "🇨🇲 Cameroon" : "🇺🇸 US Grid",
                          style: const TextStyle(color: Colors.white, fontSize: 9.5, fontWeight: FontWeight.bold),
                        ),
                      ),
                    ),
                    const SizedBox(width: 6),

                    // Quick Open US CAM 4K Button
                    InkWell(
                      onTap: () => _showCCTVModal(usCameras[0]),
                      borderRadius: BorderRadius.circular(8),
                      child: Container(
                        padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 4),
                        decoration: BoxDecoration(
                          color: const Color(0xFF00D4FF),
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: const Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Icon(Icons.videocam, color: Colors.black, size: 12),
                            SizedBox(width: 3),
                            Text(
                              "US CAM",
                              style: TextStyle(color: Colors.black, fontSize: 9.5, fontWeight: FontWeight.w900),
                            ),
                          ],
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ),

          // Tactical Floating Action Buttons (God's Eye Toggle + Recenter)
          Positioned(
            right: 16,
            bottom: widget.bottomPadding ?? 16,
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                // God's Eye Mode Switch Button
                FloatingActionButton.small(
                  heroTag: 'gods_eye_toggle',
                  backgroundColor: _godsEyeMode ? const Color(0xFF00D4FF) : (isDark ? AppColors.cardDark : Colors.white),
                  foregroundColor: _godsEyeMode ? Colors.black : AppColors.primary,
                  tooltip: "Toggle God's Eye Satellite Recon",
                  onPressed: _toggleGodsEye,
                  child: Icon(
                    _godsEyeMode ? LucideIcons.globe : LucideIcons.eye,
                    size: 20,
                  ),
                ),
                const SizedBox(height: 10),
                // Recenter Button
                FloatingActionButton.small(
                  heroTag: 'recenter_map',
                  backgroundColor: isDark ? AppColors.cardDark : Colors.white,
                  foregroundColor: AppColors.primary,
                  onPressed: () {
                    final target = _effectiveUserLocation;
                    _mapController.move(target, 15.0);
                  },
                  child: const Icon(LucideIcons.locateFixed, size: 20),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _GridPainter extends CustomPainter {
  final bool isThermal;
  _GridPainter({required this.isThermal});

  @override
  void paint(Canvas canvas, Size size) {
    final linePaint = Paint()
      ..color = isThermal ? const Color(0x2200D4FF) : const Color(0x2210B981)
      ..strokeWidth = 1.0;

    const spacing = 24.0;
    for (double y = 0; y < size.height; y += spacing) {
      canvas.drawLine(Offset(0, y), Offset(size.width, y), linePaint);
    }
    for (double x = 0; x < size.width; x += spacing) {
      canvas.drawLine(Offset(x, 0), Offset(x, size.height), linePaint);
    }

    final cornerPaint = Paint()
      ..color = isThermal ? const Color(0xAA00D4FF) : const Color(0xAA10B981)
      ..strokeWidth = 2.0
      ..style = PaintingStyle.stroke;

    const len = 16.0;
    canvas.drawLine(const Offset(10, 10), const Offset(10 + len, 10), cornerPaint);
    canvas.drawLine(const Offset(10, 10), const Offset(10, 10 + len), cornerPaint);
    canvas.drawLine(Offset(size.width - 10, 10), Offset(size.width - 10 - len, 10), cornerPaint);
    canvas.drawLine(Offset(size.width - 10, 10), Offset(size.width - 10, 10 + len), cornerPaint);
    canvas.drawLine(Offset(10, size.height - 10), Offset(10 + len, size.height - 10), cornerPaint);
    canvas.drawLine(Offset(10, size.height - 10), Offset(10, size.height - 10 - len), cornerPaint);
    canvas.drawLine(Offset(size.width - 10, size.height - 10), Offset(size.width - 10 - len, size.height - 10), cornerPaint);
    canvas.drawLine(Offset(size.width - 10, size.height - 10), Offset(size.width - 10, size.height - 10 - len), cornerPaint);
  }

  @override
  bool shouldRepaint(covariant _GridPainter oldDelegate) => oldDelegate.isThermal != isThermal;
}
