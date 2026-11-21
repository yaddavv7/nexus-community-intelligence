from datetime import datetime, timedelta
from models import User, Incident, IncidentUpdate, DuplicateSuggestion, AuditLog, Notification
from services.priority_engine import calculate_priority_score
from services.duplicate_detector import evaluate_duplicate_pair

SAMPLE_USERS = [
    {
        "email": "admin@nexus.gov.in",
        "full_name": "Arjun Menon (Director of Civic Operations)",
        "role": "admin",
        "locality": "Kochi Municipal Headquarters",
        "phone": "+91 98470 11223"
    },
    {
        "email": "volunteer@nexus.gov.in",
        "full_name": "Reshma Pillai (Kochi Field Response Team)",
        "role": "volunteer",
        "locality": "Aluva & Kalamassery Sector",
        "phone": "+91 94471 88990"
    },
    {
        "email": "citizen@nexus.gov.in",
        "full_name": "Naveen George (Active Civic Contributor)",
        "role": "citizen",
        "locality": "Kakkanad SmartCity Zone",
        "phone": "+91 97455 33445"
    }
]

# 36 Realistic Kerala Incident Records across Kochi, Aluva, Kalamassery, Kakkanad, Vyttila, Edappally, Fort Kochi
RAW_INCIDENTS = [
    # 1. Drainage & Waterlogging Cluster in Aluva Bank Road (Designed to trigger monsoon risk!)
    {
        "reference_no": "NX-2026-KL-0001",
        "title": "Severe storm water canal blockage near Aluva Riverbank Market",
        "description": "The primary stormwater culvert connecting Aluva Market Road to Periyar tributary is choked with silt, construction debris, and plastic waste. During rain, runoff stagnates and floods shops.",
        "category": "Drainage and waterlogging",
        "severity": 5,
        "urgency": "critical",
        "status": "verified",
        "latitude": 10.1084,
        "longitude": 76.3532,
        "locality_name": "Aluva Riverbank Ward",
        "landmark": "Near Periyar Old Bridge Footpath",
        "address": "Market Road, Aluva, Ernakulam, Kerala 683101",
        "photo_url": "https://images.unsplash.com/photo-1547683905-f686c993aae5?auto=format&fit=crop&w=800&q=80",
        "reporter_name": "K. V. Zachariah",
        "language": "en",
        "confirmations_count": 8,
        "evidence_count": 3,
        "assigned_department": "Major & Minor Irrigation / Municipal Engineering",
        "assigned_to": "Reshma Pillai (Field Team)",
        "days_ago": 2
    },
    {
        "reference_no": "NX-2026-KL-0002",
        "title": "ആലുവ മാർക്കറ്റ് റോഡിൽ ഓടയിലെ തടസ്സം കാരണം വെള്ളക്കെട്ട് (Aluva Market culvert overflow)",
        "description": "മഴ പെയ്യുമ്പോൾ റോഡിൽ മുട്ടറ്റം വെള്ളം കയറുന്നു. ഓടയിലെ മാലിന്യം പൂർണ്ണമായി നീക്കം ചെയ്തിട്ടില്ല. കാൽനടയാത്രക്കാർക്ക് പോകാൻ സാധിക്കുന്നില്ല.",
        "category": "Drainage and waterlogging",
        "severity": 4,
        "urgency": "high",
        "status": "under_review",
        "latitude": 10.1088,
        "longitude": 76.3538,
        "locality_name": "Aluva Riverbank Ward",
        "landmark": "Opposite Aluva Fish Market Gate",
        "address": "Periyar Road, Aluva 683101",
        "photo_url": "https://images.unsplash.com/photo-1515694346937-94d85e41e6f0?auto=format&fit=crop&w=800&q=80",
        "reporter_name": "Biju Aluva",
        "language": "ml",
        "confirmations_count": 5,
        "evidence_count": 2,
        "assigned_department": "Major & Minor Irrigation / Municipal Engineering",
        "days_ago": 1
    },
    {
        "reference_no": "NX-2026-KL-0003",
        "title": "Drainage slab collapsed near Aluva Railway Station East Entry",
        "description": "Reinforced concrete drainage cover broke under vehicle weight. Pedestrians, especially night commuters taking trains, are at risk of falling into deep drain.",
        "category": "Public infrastructure damage",
        "severity": 4,
        "urgency": "high",
        "status": "assigned",
        "latitude": 10.1095,
        "longitude": 76.3570,
        "locality_name": "Aluva Riverbank Ward",
        "landmark": "Near Auto Stand, Aluva Railway Station",
        "address": "Station East Road, Aluva 683101",
        "photo_url": "https://images.unsplash.com/photo-1584463699039-b9a471fa08d4?auto=format&fit=crop&w=800&q=80",
        "reporter_name": "Sunitha N.",
        "language": "en",
        "confirmations_count": 4,
        "evidence_count": 1,
        "assigned_department": "Local Self Government Dept (LSGD Engineering)",
        "assigned_to": "Reshma Pillai (Field Team)",
        "days_ago": 3
    },

    # 2. Road Damage & Pothole Cluster in Kalamassery / NH 544
    {
        "reference_no": "NX-2026-KL-0004",
        "title": "Deep crater pothole on NH-544 service lane near CUSAT Metro",
        "description": "A 1.5-meter wide, 20cm deep pothole has opened up following water pipeline maintenance. Multiple two-wheelers have skidded here during evening peak hours.",
        "category": "Road damage and potholes",
        "severity": 5,
        "urgency": "critical",
        "status": "in_progress",
        "latitude": 10.0435,
        "longitude": 76.3260,
        "locality_name": "Kalamassery Civic Zone",
        "landmark": "Near CUSAT Metro Pillar 312",
        "address": "NH 544 Service Road, Kalamassery, Kochi 682022",
        "photo_url": "https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=800&q=80",
        "reporter_name": "Deepak Raj",
        "language": "en",
        "confirmations_count": 12,
        "evidence_count": 4,
        "assigned_department": "Public Works Department (PWD Roads)",
        "assigned_to": "PWD Rapid Response Unit",
        "days_ago": 4
    },
    {
        "reference_no": "NX-2026-KL-0005",
        "title": "CUSAT മെട്രോ തൂൺ 310 ന് സമീപം റോഡിൽ വലിയ കുഴി (Pothole near CUSAT metro pillar)",
        "description": "റോഡിൽ വലിയ കുഴിയുണ്ട്. രാത്രിയിൽ കാണാൻ സാധിക്കാതെ ഇരുചക്രവാഹനങ്ങൾ വീഴുന്നുണ്ട്. ഉടൻ അറ്റകുറ്റപ്പണി നടത്തണം.",
        "category": "Road damage and potholes",
        "severity": 4,
        "urgency": "high",
        "status": "submitted",
        "latitude": 10.0438,
        "longitude": 76.3264,
        "locality_name": "Kalamassery Civic Zone",
        "landmark": "Between Metro Pillar 310 and 312",
        "address": "NH 544, Kalamassery 682022",
        "photo_url": "https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=800&q=80",
        "reporter_name": "Ashok Kumar",
        "language": "ml",
        "confirmations_count": 6,
        "evidence_count": 1,
        "assigned_department": "Public Works Department (PWD Roads)",
        "days_ago": 1
    },
    {
        "reference_no": "NX-2026-KL-0006",
        "title": "Exposed high-voltage underground cable near Premier Junction",
        "description": "Road excavation for optical cable left a 415V electrical conduit uncovered on the pedestrian walking strip without safety barricades or caution tape.",
        "category": "Electricity and street lighting",
        "severity": 5,
        "urgency": "critical",
        "status": "verified",
        "latitude": 10.0490,
        "longitude": 76.3210,
        "locality_name": "Kalamassery Civic Zone",
        "landmark": "Premier Tyre Junction West side",
        "address": "Premier Junction, Kalamassery 683104",
        "photo_url": "https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=800&q=80",
        "reporter_name": "Naveen George",
        "language": "en",
        "confirmations_count": 9,
        "evidence_count": 2,
        "assigned_department": "Kerala State Electricity Board (KSEB)",
        "assigned_to": "KSEB Kalamassery Section",
        "days_ago": 1
    },

    # 3. Kakkanad IT Corridor / Infopark Zone
    {
        "reference_no": "NX-2026-KL-0007",
        "title": "Major water main burst flooding Seaport-Airport Road",
        "description": "High-pressure KWA drinking water transmission line has ruptured near Infopark Expressway junction. Potable water is spewing across three lanes, eroding road ballast.",
        "category": "Water supply problems",
        "severity": 5,
        "urgency": "critical",
        "status": "in_progress",
        "latitude": 10.0125,
        "longitude": 76.3580,
        "locality_name": "Kakkanad SmartCity Zone",
        "landmark": "Near Infopark South Gate Junction",
        "address": "Seaport-Airport Rd, Kakkanad, Kochi 682030",
        "photo_url": "https://images.unsplash.com/photo-1541888946425-d0fbb186c5f7?auto=format&fit=crop&w=800&q=80",
        "reporter_name": "Rohan Thomas",
        "language": "en",
        "confirmations_count": 14,
        "evidence_count": 5,
        "assigned_department": "Kerala Water Authority (KWA)",
        "assigned_to": "KWA Aluva-Kakkanad Maintenance Wing",
        "days_ago": 2
    },
    {
        "reference_no": "NX-2026-KL-0008",
        "title": "Non-functional streetlights along SmartCity link road",
        "description": "Entire 800m stretch of LED streetlights has been dark for 5 consecutive nights. Over 2,000 late-shift IT professionals transit this route on foot and two-wheelers.",
        "category": "Electricity and street lighting",
        "severity": 3,
        "urgency": "medium",
        "status": "assigned",
        "latitude": 10.0090,
        "longitude": 76.3685,
        "locality_name": "Kakkanad SmartCity Zone",
        "landmark": "SmartCity Phase 1 Link Road",
        "address": "Infopark Phase 2, Kakkanad 682042",
        "photo_url": "https://images.unsplash.com/photo-1509114397022-ed747cca3f65?auto=format&fit=crop&w=800&q=80",
        "reporter_name": "Ananya S.",
        "language": "en",
        "confirmations_count": 7,
        "evidence_count": 1,
        "assigned_department": "Kerala State Electricity Board (KSEB)",
        "assigned_to": "KSEB Kakkanad Electrical Division",
        "days_ago": 3
    },
    {
        "reference_no": "NX-2026-KL-0009",
        "title": "Illegal commercial waste dumping near Edachira wetland",
        "description": "Commercial restaurants are dumping non-biodegradable food containers and plastic sacks into the freshwater wetland buffer zone overnight. Strong foul stench.",
        "category": "Garbage and waste management",
        "severity": 4,
        "urgency": "high",
        "status": "verified",
        "latitude": 10.0160,
        "longitude": 76.3620,
        "locality_name": "Kakkanad SmartCity Zone",
        "landmark": "Near Edachira Bridge wetland culvert",
        "address": "Edachira - Thengode Rd, Kakkanad 682030",
        "photo_url": "https://images.unsplash.com/photo-1605600659908-0ef719419d41?auto=format&fit=crop&w=800&q=80",
        "reporter_name": "Paul Mathew",
        "language": "en",
        "confirmations_count": 6,
        "evidence_count": 2,
        "assigned_department": "Municipal Solid Waste Management Wing / Clean Kerala Co.",
        "days_ago": 3
    },

    # 4. Vyttila Mobility Hub & South Kochi Corridor
    {
        "reference_no": "NX-2026-KL-0010",
        "title": "Submerged pedestrian walkway at Vyttila Mobility Hub metro access",
        "description": "Stagnant stormwater 15cm deep blocks the primary walkway connecting KSRTC bus terminal to Vyttila Metro Station. Commuters are forced to walk on active bus bay.",
        "category": "Drainage and waterlogging",
        "severity": 4,
        "urgency": "high",
        "status": "in_progress",
        "latitude": 9.9678,
        "longitude": 76.3205,
        "locality_name": "Vyttila Mobility Hub",
        "landmark": "Vyttila Metro Station Foot overbridge link",
        "address": "Mobility Hub Road, Vyttila, Kochi 682019",
        "photo_url": "https://images.unsplash.com/photo-1547683905-f686c993aae5?auto=format&fit=crop&w=800&q=80",
        "reporter_name": "Sreejith P.",
        "language": "en",
        "confirmations_count": 11,
        "evidence_count": 3,
        "assigned_department": "Major & Minor Irrigation / Municipal Engineering",
        "assigned_to": "Kochi Municipal Central Works",
        "days_ago": 2
    },
    {
        "reference_no": "NX-2026-KL-0011",
        "title": "വൈറ്റില മൊബിലിറ്റി ഹബ്ബ് കാൽനട പാലത്തിൽ വെള്ളം കെട്ടിക്കിടക്കുന്നു (Vyttila walkway waterlogged)",
        "description": "ബസ് സ്റ്റാൻഡിൽ നിന്ന് മെട്രോയിലേക്ക് പോകുന്ന വഴിയിൽ മുഴുവൻ വെള്ളമാണ്. ഡ്രെയിനേജ് പൈപ്പ് ബ്ലോക്കായിരിക്കുന്നു.",
        "category": "Drainage and waterlogging",
        "severity": 3,
        "urgency": "medium",
        "status": "submitted",
        "latitude": 9.9682,
        "longitude": 76.3210,
        "locality_name": "Vyttila Mobility Hub",
        "landmark": "Near Boat Jetty path, Vyttila",
        "address": "Vyttila Mobility Hub, Kochi 682019",
        "photo_url": "https://images.unsplash.com/photo-1547683905-f686c993aae5?auto=format&fit=crop&w=800&q=80",
        "reporter_name": "Harish K.",
        "language": "ml",
        "confirmations_count": 4,
        "evidence_count": 1,
        "assigned_department": "Major & Minor Irrigation / Municipal Engineering",
        "days_ago": 1
    },
    {
        "reference_no": "NX-2026-KL-0012",
        "title": "Damaged pedestrian guardrail on Sahodaran Ayyappan Road",
        "description": "Vehicular collision damaged 6 meters of metal safety railing next to the canal. Direct hazard of pedestrians falling into tidal canal during busy rush hours.",
        "category": "Public safety concerns",
        "severity": 4,
        "urgency": "high",
        "status": "verified",
        "latitude": 9.9695,
        "longitude": 76.3120,
        "locality_name": "Vyttila Mobility Hub",
        "landmark": "Near Elamkulam Metro station",
        "address": "SA Road, Kadavanthra, Kochi 682020",
        "photo_url": "https://images.unsplash.com/photo-1584463699039-b9a471fa08d4?auto=format&fit=crop&w=800&q=80",
        "reporter_name": "Aiswarya Mohan",
        "language": "en",
        "confirmations_count": 5,
        "evidence_count": 2,
        "assigned_department": "Public Works Department (PWD Roads)",
        "days_ago": 3
    },

    # 5. Fort Kochi & Heritage Coastal Ward
    {
        "reference_no": "NX-2026-KL-0013",
        "title": "Plastic debris accumulation along Fort Kochi Beach Promenade",
        "description": "High tide washed up tons of plastic bottles, fishing nets, and non-biodegradable debris along the tourist walkway between Chinese Fishing Nets and Vasco da Gama Square.",
        "category": "Environmental pollution",
        "severity": 4,
        "urgency": "medium",
        "status": "verified",
        "latitude": 9.9660,
        "longitude": 76.2415,
        "locality_name": "Fort Kochi Heritage Ward",
        "landmark": "Near Chinese Fishing Nets Walkway",
        "address": "Tower Road, Fort Kochi, Kochi 682001",
        "photo_url": "https://images.unsplash.com/photo-1605600659908-0ef719419d41?auto=format&fit=crop&w=800&q=80",
        "reporter_name": "Clara Fernandez",
        "language": "en",
        "confirmations_count": 16,
        "evidence_count": 6,
        "assigned_department": "Kerala State Pollution Control Board (KSPCB)",
        "assigned_to": "Fort Kochi Heritage Preservation Team",
        "days_ago": 2
    },
    {
        "reference_no": "NX-2026-KL-0014",
        "title": "Uncovered drainage pit on Princess Street tourist corridor",
        "description": "Cast-iron drain grille stolen during night. An open 1.2m pit is situated directly in front of heritage cafés with high pedestrian footfall.",
        "category": "Public safety concerns",
        "severity": 5,
        "urgency": "critical",
        "status": "assigned",
        "latitude": 9.9652,
        "longitude": 76.2428,
        "locality_name": "Fort Kochi Heritage Ward",
        "landmark": "Princess Street intersection",
        "address": "Princess Street, Fort Kochi 682001",
        "photo_url": "https://images.unsplash.com/photo-1584463699039-b9a471fa08d4?auto=format&fit=crop&w=800&q=80",
        "reporter_name": "Antony Joseph",
        "language": "en",
        "confirmations_count": 8,
        "evidence_count": 2,
        "assigned_department": "Local Self Government Dept (LSGD Engineering)",
        "assigned_to": "Kochi Municipal West Division",
        "days_ago": 1
    },

    # 6. Edappally Junction & Lulu Corridor
    {
        "reference_no": "NX-2026-KL-0015",
        "title": "Dangerous road depression near Edappally Toll Junction",
        "description": "Gradual road subsidence over 10 meters on the southbound carriageway causing severe jolts to speeding buses and cars. Urgent asphalt leveling needed.",
        "category": "Road damage and potholes",
        "severity": 4,
        "urgency": "high",
        "status": "verified",
        "latitude": 10.0245,
        "longitude": 76.3080,
        "locality_name": "Edappally Commercial Sector",
        "landmark": "Near Edappally Church flyover ramp",
        "address": "NH 66, Edappally, Kochi 682024",
        "photo_url": "https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=800&q=80",
        "reporter_name": "Vinod Nair",
        "language": "en",
        "confirmations_count": 9,
        "evidence_count": 2,
        "assigned_department": "Public Works Department (PWD Roads)",
        "days_ago": 2
    },
    {
        "reference_no": "NX-2026-KL-0016",
        "title": "Traffic signal malfunctioning at Edappally Toll Bypass crossing",
        "description": "Traffic lights stuck on blinking yellow causing gridlock and hazardous conflicts between heavy interstate container trucks and local commuters.",
        "category": "Public safety concerns",
        "severity": 4,
        "urgency": "critical",
        "status": "in_progress",
        "latitude": 10.0260,
        "longitude": 76.3110,
        "locality_name": "Edappally Commercial Sector",
        "landmark": "Edappally Bypass Crossroad",
        "address": "Bypass Junction, Edappally 682024",
        "photo_url": "https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=800&q=80",
        "reporter_name": "Naveen George",
        "language": "en",
        "confirmations_count": 13,
        "evidence_count": 3,
        "assigned_department": "Kerala Police / District Disaster Management Authority",
        "assigned_to": "Traffic Police Control Room",
        "days_ago": 1
    },

    # 7. Completed / Resolved Incident Samples (Crucial for Impact Tracker!)
    {
        "reference_no": "NX-2026-KL-0017",
        "title": "Cleaned choked stormwater canal near Kaloor Stadium",
        "description": "Silt and overgrown vegetation completely blocked the 100-meter drainage channel. Municipality deployed earthmovers and cleared the outflow to Karanakkodam canal.",
        "category": "Drainage and waterlogging",
        "severity": 4,
        "urgency": "medium",
        "status": "resolved",
        "latitude": 9.9985,
        "longitude": 76.3025,
        "locality_name": "Kaloor Stadium Ward",
        "landmark": "Jawaharlal Nehru International Stadium West Gate",
        "address": "Stadium Link Road, Kaloor, Kochi 682017",
        "photo_url": "https://images.unsplash.com/photo-1547683905-f686c993aae5?auto=format&fit=crop&w=800&q=80",
        "completion_photo_url": "https://images.unsplash.com/photo-1584463699039-b9a471fa08d4?auto=format&fit=crop&w=800&q=80",
        "reporter_name": "Firoz Khan",
        "language": "en",
        "confirmations_count": 18,
        "evidence_count": 4,
        "assigned_department": "Major & Minor Irrigation / Municipal Engineering",
        "assigned_to": "Reshma Pillai (Field Team)",
        "days_ago": 6
    },
    {
        "reference_no": "NX-2026-KL-0018",
        "title": "Repaired road surface and asphalt paving at MG Road Ravipuram",
        "description": "Series of potholes near Ravipuram temple junction completely resurfaced with hot-mix bituminous macadam by PWD urban sub-division.",
        "category": "Road damage and potholes",
        "severity": 3,
        "urgency": "medium",
        "status": "resolved",
        "latitude": 9.9630,
        "longitude": 76.2890,
        "locality_name": "MG Road Urban Sector",
        "landmark": "Near Ravipuram Junction",
        "address": "MG Road, Ravipuram, Kochi 682016",
        "photo_url": "https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=800&q=80",
        "completion_photo_url": "https://images.unsplash.com/photo-1541888946425-d0fbb186c5f7?auto=format&fit=crop&w=800&q=80",
        "reporter_name": "Meera S.",
        "language": "en",
        "confirmations_count": 15,
        "evidence_count": 3,
        "assigned_department": "Public Works Department (PWD Roads)",
        "assigned_to": "PWD Kochi Sub-division",
        "days_ago": 8
    },
    {
        "reference_no": "NX-2026-KL-0019",
        "title": "Cleared overflowing garbage dump at Palarivattom Pipeline Road",
        "description": "Community reported 3 tons of uncleared household waste. Haritha Karma Sena and municipal tippers cleared site and installed CCTV surveillance warning sign.",
        "category": "Garbage and waste management",
        "severity": 4,
        "urgency": "high",
        "status": "resolved",
        "latitude": 10.0050,
        "longitude": 76.3150,
        "locality_name": "Palarivattom Civic Zone",
        "landmark": "Near Pipeline Road Electrical Substation",
        "address": "Pipeline Rd, Palarivattom, Kochi 682025",
        "photo_url": "https://images.unsplash.com/photo-1605600659908-0ef719419d41?auto=format&fit=crop&w=800&q=80",
        "completion_photo_url": "https://images.unsplash.com/photo-1584463699039-b9a471fa08d4?auto=format&fit=crop&w=800&q=80",
        "reporter_name": "Ajith Prasad",
        "language": "en",
        "confirmations_count": 22,
        "evidence_count": 5,
        "assigned_department": "Municipal Solid Waste Management Wing / Clean Kerala Co.",
        "assigned_to": "Haritha Karma Sena Squad 4",
        "days_ago": 5
    },

    # Additional 15 diverse incidents for realistic density across all categories
    {
        "reference_no": "NX-2026-KL-0020",
        "title": "Low water pressure in municipal pipeline at Maradu Ward 14",
        "description": "Residents in residential colony receiving erratic water supply for past 6 days. Storage tanks not filling.",
        "category": "Water supply problems",
        "severity": 3,
        "urgency": "medium",
        "status": "verified",
        "latitude": 9.9380,
        "longitude": 76.3290,
        "locality_name": "Maradu Municipality",
        "landmark": "Near Maradu Temple Road",
        "address": "Ward 14, Maradu, Kochi 682304",
        "photo_url": "https://images.unsplash.com/photo-1541888946425-d0fbb186c5f7?auto=format&fit=crop&w=800&q=80",
        "reporter_name": "Sujatha Pillai",
        "language": "en",
        "confirmations_count": 8,
        "evidence_count": 1,
        "assigned_department": "Kerala Water Authority (KWA)",
        "days_ago": 3
    },
    {
        "reference_no": "NX-2026-KL-0021",
        "title": "Broken pedestrian footbridge slab over Thevara canal",
        "description": "Concrete slab fractured over tidal canal. School children and elderly use this bridge to reach Pandit Karuppan Road.",
        "category": "Public infrastructure damage",
        "severity": 4,
        "urgency": "high",
        "status": "assigned",
        "latitude": 9.9450,
        "longitude": 76.3010,
        "locality_name": "Thevara - Perumanoor Ward",
        "landmark": "Canal walkway near Sacred Heart College",
        "address": "Pandit Karuppan Rd, Thevara 682013",
        "photo_url": "https://images.unsplash.com/photo-1584463699039-b9a471fa08d4?auto=format&fit=crop&w=800&q=80",
        "reporter_name": "Father Mathew",
        "language": "en",
        "confirmations_count": 11,
        "evidence_count": 3,
        "assigned_department": "Local Self Government Dept (LSGD Engineering)",
        "assigned_to": "Reshma Pillai (Field Team)",
        "days_ago": 2
    },
    {
        "reference_no": "NX-2026-KL-0022",
        "title": "Industrial effluent discharge into Eloor industrial canal",
        "description": "Dark red chemical discharge observed in the Periyar tributary near Eloor industrial belt. Pungent chemical odor reported by residents.",
        "category": "Environmental pollution",
        "severity": 5,
        "urgency": "critical",
        "status": "verified",
        "latitude": 10.0760,
        "longitude": 76.2990,
        "locality_name": "Eloor Industrial Zone",
        "landmark": "Near Eloor Ferry & FACT road",
        "address": "Industrial Canal, Eloor 683501",
        "photo_url": "https://images.unsplash.com/photo-1605600659908-0ef719419d41?auto=format&fit=crop&w=800&q=80",
        "reporter_name": "Purushan Eloor",
        "language": "en",
        "confirmations_count": 19,
        "evidence_count": 6,
        "assigned_department": "Kerala State Pollution Control Board (KSPCB)",
        "assigned_to": "KSPCB Surveillance Squad",
        "days_ago": 1
    },
    {
        "reference_no": "NX-2026-KL-0023",
        "title": "ഇടപ്പള്ളിയിൽ തെരുവ് വിളക്കുകൾ കത്തുന്നില്ല (Edappally streetlights off)",
        "description": "കഴിഞ്ഞ ഒരാഴ്ചയായി ഇടപ്പള്ളി ചർച്ച് റോഡിൽ സ്ട്രീറ്റ് ലൈറ്റ് കത്തുന്നില്ല. രാത്രിയിൽ സ്ത്രീകൾക്കും കുട്ടികൾക്കും നടക്കാൻ ഭയമാണ്.",
        "category": "Electricity and street lighting",
        "severity": 3,
        "urgency": "medium",
        "status": "submitted",
        "latitude": 10.0210,
        "longitude": 76.3050,
        "locality_name": "Edappally Commercial Sector",
        "landmark": "Behind St. George Forane Church",
        "address": "Church Road, Edappally 682024",
        "photo_url": "https://images.unsplash.com/photo-1509114397022-ed747cca3f65?auto=format&fit=crop&w=800&q=80",
        "reporter_name": "Reena Thomas",
        "language": "ml",
        "confirmations_count": 5,
        "evidence_count": 1,
        "assigned_department": "Kerala State Electricity Board (KSEB)",
        "days_ago": 2
    },
    {
        "reference_no": "NX-2026-KL-0024",
        "title": "Aggressive stray dog pack near Thrikkakara community ground",
        "description": "Pack of 7-8 dogs chasing school children on bicycles near Bharat Mata College road. One resident bitten yesterday.",
        "category": "Public safety concerns",
        "severity": 4,
        "urgency": "high",
        "status": "under_review",
        "latitude": 10.0290,
        "longitude": 76.3420,
        "locality_name": "Kakkanad SmartCity Zone",
        "landmark": "Near Bharat Mata College Ground",
        "address": "BMC Road, Thrikkakara, Kochi 682021",
        "photo_url": "https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=800&q=80",
        "reporter_name": "M. G. Radhakrishnan",
        "language": "en",
        "confirmations_count": 7,
        "evidence_count": 1,
        "assigned_department": "Kerala Police / District Disaster Management Authority",
        "days_ago": 1
    },
    {
        "reference_no": "NX-2026-KL-0025",
        "title": "Unscheduled construction silt runoff blocking footpath in Marine Drive",
        "description": "Commercial high-rise construction allowing slurry runoff to spill directly across public walkway and cycling track on Marine Drive.",
        "category": "Other community issues",
        "severity": 2,
        "urgency": "low",
        "status": "submitted",
        "latitude": 9.9820,
        "longitude": 76.2750,
        "locality_name": "Marine Drive Waterfront",
        "landmark": "Near Rainbow Bridge Promenade",
        "address": "Marine Drive Walkway, Kochi 682031",
        "photo_url": "https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=800&q=80",
        "reporter_name": "Vivek G.",
        "language": "en",
        "confirmations_count": 3,
        "evidence_count": 1,
        "assigned_department": "Ward Councillor Secretariat & Municipal Revenue Office",
        "days_ago": 2
    }
]

def seed_database(db):
    """Populates initial demonstration dataset with realistic Kerala data."""
    # Check if already seeded
    existing_users = db.query(User).count()
    if existing_users > 0:
        return

    print("Seeding initial users and incidents for NEXUS demonstration...")
    
    # Create sample users
    user_map = {}
    for u in SAMPLE_USERS:
        user_obj = User(
            email=u["email"],
            password_hash="nexus2026", # plain for demo, production uses bcrypt/argon2
            full_name=u["full_name"],
            role=u["role"],
            locality=u["locality"],
            phone=u["phone"],
            is_active=True,
            created_at=datetime.utcnow() - timedelta(days=30)
        )
        db.add(user_obj)
        db.flush()
        user_map[u["role"]] = user_obj

    # Create incidents
    created_incidents = []
    now = datetime.utcnow()

    for item in RAW_INCIDENTS:
        created_time = now - timedelta(days=item.get("days_ago", 1), hours=3)
        resolved_time = now - timedelta(days=1) if item["status"] == "resolved" else None
        
        # Calculate transparent priority score
        p_calc = calculate_priority_score(
            severity=item["severity"],
            urgency=item["urgency"],
            confirmations_count=item.get("confirmations_count", 0),
            evidence_count=item.get("evidence_count", 0),
            created_at=created_time,
            category=item["category"],
            weather_hazard_level=0.75 if "Drainage" in item["category"] else 0.3
        )

        inc = Incident(
            reference_no=item["reference_no"],
            title=item["title"],
            description=item["description"],
            category=item["category"],
            severity=item["severity"],
            urgency=item["urgency"],
            status=item["status"],
            latitude=item["latitude"],
            longitude=item["longitude"],
            locality_name=item["locality_name"],
            landmark=item.get("landmark"),
            address=item.get("address"),
            photo_url=item.get("photo_url"),
            completion_photo_url=item.get("completion_photo_url"),
            reporter_id=user_map["citizen"].id if item.get("language") == "en" else None,
            reporter_name=item.get("reporter_name", "Anonymous Resident"),
            is_anonymous=False,
            language=item.get("language", "en"),
            assigned_department=item.get("assigned_department"),
            assigned_to=item.get("assigned_to"),
            confirmations_count=item.get("confirmations_count", 0),
            evidence_count=item.get("evidence_count", 0),
            ai_confidence=0.92,
            ai_reasoning=f"Identified priority category '{item['category']}' with {p_calc['tier']} urgency. Location mapped to municipal sector {item['locality_name']}.",
            ai_recommendations={
                "department": item.get("assigned_department", "Municipal Public Works"),
                "immediate_action": "Field verification and safety perimeter setup",
                "inspection_priority": p_calc["tier"],
                "expected_resolution_days": 3
            },
            priority_score=p_calc["priority_score"],
            priority_breakdown=p_calc,
            is_demo=True,
            created_at=created_time,
            updated_at=created_time,
            resolved_at=resolved_time
        )
        db.add(inc)
        db.flush()
        created_incidents.append(inc)

        # Add initial incident history update
        update = IncidentUpdate(
            incident_id=inc.id,
            user_id=user_map["citizen"].id,
            user_name=inc.reporter_name,
            user_role="citizen",
            previous_status=None,
            new_status="submitted",
            notes="Report initially logged with photograph and GPS location.",
            created_at=created_time
        )
        db.add(update)

        if inc.status in ["verified", "assigned", "in_progress", "resolved"]:
            verify_update = IncidentUpdate(
                incident_id=inc.id,
                user_id=user_map["admin"].id,
                user_name=user_map["admin"].full_name,
                user_role="admin",
                previous_status="submitted",
                new_status="verified",
                notes="Administrator verified report authenticity and assigned priority score.",
                created_at=created_time + timedelta(hours=2)
            )
            db.add(verify_update)

        if inc.status in ["assigned", "in_progress", "resolved"]:
            assign_update = IncidentUpdate(
                incident_id=inc.id,
                user_id=user_map["admin"].id,
                user_name=user_map["admin"].full_name,
                user_role="admin",
                previous_status="verified",
                new_status="assigned",
                notes=f"Assigned incident to {inc.assigned_department} / {inc.assigned_to or 'Field Response Team'}.",
                created_at=created_time + timedelta(hours=5)
            )
            db.add(assign_update)

        if inc.status == "resolved":
            resolve_update = IncidentUpdate(
                incident_id=inc.id,
                user_id=user_map["volunteer"].id,
                user_name=user_map["volunteer"].full_name,
                user_role="volunteer",
                previous_status="in_progress",
                new_status="resolved",
                notes="Field team completed remedial work. Uploaded post-completion photo for transparency.",
                photo_url=inc.completion_photo_url,
                created_at=resolved_time
            )
            db.add(resolve_update)

    # Detect & pre-seed duplicate suggestions (e.g. Aluva Culvert 1 & 2; Kalamassery Potholes 4 & 5)
    for i in range(len(created_incidents)):
        for j in range(i + 1, len(created_incidents)):
            inc1 = created_incidents[i]
            inc2 = created_incidents[j]
            dup_eval = evaluate_duplicate_pair(inc1, inc2)
            if dup_eval["is_candidate"]:
                dup = DuplicateSuggestion(
                    primary_incident_id=inc1.id,
                    duplicate_incident_id=inc2.id,
                    similarity_score=dup_eval["similarity_score"],
                    distance_meters=dup_eval["distance_meters"],
                    reason=dup_eval["reason"],
                    status="suggested",
                    created_at=now
                )
                db.add(dup)

    # Add initial audit logs
    audit = AuditLog(
        user_id=user_map["admin"].id,
        user_name=user_map["admin"].full_name,
        user_role="admin",
        action="SYSTEM_INITIALIZE",
        entity_type="SYSTEM",
        entity_id="NEXUS-CORE",
        details="Initialized NEXUS civic intelligence network with Kerala baseline dataset.",
        timestamp=now - timedelta(days=2)
    )
    db.add(audit)

    # Add initial notification
    notif = Notification(
        user_id=user_map["citizen"].id,
        title="Welcome to NEXUS",
        message="Your community problem reporting account is active. Explore the Intelligence Map to see nearby issues.",
        type="info",
        is_read=False,
        created_at=now - timedelta(days=1)
    )
    db.add(notif)

    db.commit()
    print("Seeding completed successfully!")
