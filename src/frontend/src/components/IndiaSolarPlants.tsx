import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Lightbulb, MapPin, Search, Sun, Zap } from "lucide-react";
import { motion } from "motion/react";
import { useMemo, useRef, useState } from "react";
import { toast } from "sonner";

interface SolarPlant {
  name: string;
  state: string;
  capacityMW: number;
  lat: number;
  lon: number;
  type: "utility" | "rooftop";
}

interface IndiaSolarPlantsProps {
  onSelectLocation: (lat: number, lon: number, cityName: string) => void;
  currentLat: number;
  currentLon: number;
}

const SOLAR_PLANTS: SolarPlant[] = [
  {
    name: "Bhadla Solar Park",
    state: "Rajasthan",
    capacityMW: 2245,
    lat: 27.54,
    lon: 71.91,
    type: "utility",
  },
  {
    name: "Pavagada Solar Park",
    state: "Karnataka",
    capacityMW: 2050,
    lat: 14.1,
    lon: 77.28,
    type: "utility",
  },
  {
    name: "Kamuthi Solar Park",
    state: "Tamil Nadu",
    capacityMW: 648,
    lat: 9.35,
    lon: 78.77,
    type: "utility",
  },
  {
    name: "Rewa Ultra Mega Solar",
    state: "Madhya Pradesh",
    capacityMW: 750,
    lat: 24.53,
    lon: 81.3,
    type: "utility",
  },
  {
    name: "Charanka Solar Park",
    state: "Gujarat",
    capacityMW: 590,
    lat: 23.93,
    lon: 71.18,
    type: "utility",
  },
  {
    name: "Ananthapuramu I & II",
    state: "Andhra Pradesh",
    capacityMW: 900,
    lat: 14.68,
    lon: 77.6,
    type: "utility",
  },
  {
    name: "Kurnool Ultra Mega",
    state: "Andhra Pradesh",
    capacityMW: 1000,
    lat: 15.83,
    lon: 78.05,
    type: "utility",
  },
  {
    name: "Pokhran Solar Plant",
    state: "Rajasthan",
    capacityMW: 150,
    lat: 26.92,
    lon: 71.92,
    type: "utility",
  },
  {
    name: "Jodhpur Solar Cluster",
    state: "Rajasthan",
    capacityMW: 300,
    lat: 26.24,
    lon: 73.02,
    type: "utility",
  },
  {
    name: "Jaisalmer Wind Park Solar",
    state: "Rajasthan",
    capacityMW: 200,
    lat: 26.91,
    lon: 70.9,
    type: "utility",
  },
  {
    name: "Khavda RE Park",
    state: "Gujarat",
    capacityMW: 30000,
    lat: 23.85,
    lon: 68.8,
    type: "utility",
  },
  {
    name: "Dholera Solar & Wind",
    state: "Gujarat",
    capacityMW: 5000,
    lat: 22.25,
    lon: 72.18,
    type: "utility",
  },
  {
    name: "Raghanesda Solar Park",
    state: "Gujarat",
    capacityMW: 700,
    lat: 23.73,
    lon: 71.64,
    type: "utility",
  },
  {
    name: "Neemuch Solar Plant",
    state: "Madhya Pradesh",
    capacityMW: 151,
    lat: 24.47,
    lon: 74.86,
    type: "utility",
  },
  {
    name: "Mandsaur Solar Project",
    state: "Madhya Pradesh",
    capacityMW: 250,
    lat: 24.07,
    lon: 75.07,
    type: "utility",
  },
  {
    name: "Nand Solar Plant",
    state: "Rajasthan",
    capacityMW: 130,
    lat: 27.44,
    lon: 73.46,
    type: "utility",
  },
  {
    name: "Sambhar Solar Park",
    state: "Rajasthan",
    capacityMW: 200,
    lat: 26.9,
    lon: 75.2,
    type: "utility",
  },
  {
    name: "Sakri Solar Plant",
    state: "Maharashtra",
    capacityMW: 125,
    lat: 20.99,
    lon: 74.14,
    type: "utility",
  },
  {
    name: "Osmanabad Solar",
    state: "Maharashtra",
    capacityMW: 100,
    lat: 18.17,
    lon: 76.04,
    type: "utility",
  },
  {
    name: "Cochin Airport Solar",
    state: "Kerala",
    capacityMW: 12,
    lat: 10.15,
    lon: 76.39,
    type: "rooftop",
  },
  {
    name: "Bellary Solar Park",
    state: "Karnataka",
    capacityMW: 50,
    lat: 15.15,
    lon: 76.92,
    type: "utility",
  },
  {
    name: "Gadag Solar Plant",
    state: "Karnataka",
    capacityMW: 50,
    lat: 15.42,
    lon: 75.62,
    type: "utility",
  },
  {
    name: "Bijapur Solar Park",
    state: "Karnataka",
    capacityMW: 40,
    lat: 16.83,
    lon: 75.72,
    type: "utility",
  },
  {
    name: "Tuticorin Solar Plant",
    state: "Tamil Nadu",
    capacityMW: 100,
    lat: 8.8,
    lon: 78.13,
    type: "utility",
  },
  {
    name: "Tirunelveli Solar",
    state: "Tamil Nadu",
    capacityMW: 75,
    lat: 8.73,
    lon: 77.7,
    type: "utility",
  },
  {
    name: "Ramanathapuram Solar",
    state: "Tamil Nadu",
    capacityMW: 100,
    lat: 9.37,
    lon: 78.83,
    type: "utility",
  },
  {
    name: "Nellore Solar Plant",
    state: "Andhra Pradesh",
    capacityMW: 100,
    lat: 14.44,
    lon: 79.99,
    type: "utility",
  },
  {
    name: "Kadapa Solar Park",
    state: "Andhra Pradesh",
    capacityMW: 250,
    lat: 14.47,
    lon: 78.82,
    type: "utility",
  },
  {
    name: "Hindupur Solar",
    state: "Andhra Pradesh",
    capacityMW: 50,
    lat: 13.83,
    lon: 77.49,
    type: "utility",
  },
  {
    name: "Gandikota Solar Park",
    state: "Andhra Pradesh",
    capacityMW: 50,
    lat: 15.14,
    lon: 78.23,
    type: "utility",
  },
  {
    name: "Mirzapur Solar Plant",
    state: "Uttar Pradesh",
    capacityMW: 750,
    lat: 25.14,
    lon: 82.57,
    type: "utility",
  },
  {
    name: "Fatehpur Solar Plant",
    state: "Uttar Pradesh",
    capacityMW: 70,
    lat: 25.93,
    lon: 80.81,
    type: "utility",
  },
  {
    name: "Gonda Solar Park",
    state: "Uttar Pradesh",
    capacityMW: 100,
    lat: 27.13,
    lon: 81.97,
    type: "utility",
  },
  {
    name: "Koppal Solar Park",
    state: "Karnataka",
    capacityMW: 100,
    lat: 15.35,
    lon: 76.15,
    type: "utility",
  },
  {
    name: "Tumkur Solar Park",
    state: "Karnataka",
    capacityMW: 100,
    lat: 13.34,
    lon: 77.1,
    type: "utility",
  },
  {
    name: "Bidar Solar",
    state: "Karnataka",
    capacityMW: 50,
    lat: 17.91,
    lon: 77.53,
    type: "utility",
  },
  {
    name: "Suryapet Solar",
    state: "Telangana",
    capacityMW: 100,
    lat: 17.14,
    lon: 79.63,
    type: "utility",
  },
  {
    name: "Mahabubnagar Solar",
    state: "Telangana",
    capacityMW: 75,
    lat: 16.74,
    lon: 77.99,
    type: "utility",
  },
  {
    name: "Nalgonda Solar Park",
    state: "Telangana",
    capacityMW: 100,
    lat: 17.05,
    lon: 79.26,
    type: "utility",
  },
  {
    name: "Jamnagar Solar",
    state: "Gujarat",
    capacityMW: 200,
    lat: 22.47,
    lon: 70.06,
    type: "utility",
  },
  {
    name: "Kutch Solar Park",
    state: "Gujarat",
    capacityMW: 500,
    lat: 23.24,
    lon: 69.67,
    type: "utility",
  },
  {
    name: "Amreli Solar",
    state: "Gujarat",
    capacityMW: 150,
    lat: 21.6,
    lon: 71.22,
    type: "utility",
  },
  {
    name: "Bhuj Solar Plant",
    state: "Gujarat",
    capacityMW: 120,
    lat: 23.25,
    lon: 69.67,
    type: "utility",
  },
  {
    name: "Bikaner Solar Park",
    state: "Rajasthan",
    capacityMW: 500,
    lat: 28.02,
    lon: 73.31,
    type: "utility",
  },
  {
    name: "Barmer Solar Plant",
    state: "Rajasthan",
    capacityMW: 250,
    lat: 25.75,
    lon: 71.39,
    type: "utility",
  },
  {
    name: "Nagaur Solar Park",
    state: "Rajasthan",
    capacityMW: 300,
    lat: 27.2,
    lon: 73.73,
    type: "utility",
  },
  {
    name: "Sirohi Solar",
    state: "Rajasthan",
    capacityMW: 100,
    lat: 24.88,
    lon: 72.86,
    type: "utility",
  },
  {
    name: "Phalodi Solar",
    state: "Rajasthan",
    capacityMW: 200,
    lat: 27.13,
    lon: 72.37,
    type: "utility",
  },
  {
    name: "Bhilwara Solar",
    state: "Rajasthan",
    capacityMW: 100,
    lat: 25.35,
    lon: 74.63,
    type: "utility",
  },
  {
    name: "Ajmer Solar",
    state: "Rajasthan",
    capacityMW: 50,
    lat: 26.45,
    lon: 74.64,
    type: "utility",
  },
  {
    name: "Panna Solar Plant",
    state: "Madhya Pradesh",
    capacityMW: 100,
    lat: 24.72,
    lon: 80.18,
    type: "utility",
  },
  {
    name: "Singrauli Solar",
    state: "Madhya Pradesh",
    capacityMW: 200,
    lat: 24.2,
    lon: 82.67,
    type: "utility",
  },
  {
    name: "Morena Solar",
    state: "Madhya Pradesh",
    capacityMW: 200,
    lat: 26.5,
    lon: 77.99,
    type: "utility",
  },
  {
    name: "Shajapur Solar",
    state: "Madhya Pradesh",
    capacityMW: 100,
    lat: 23.43,
    lon: 76.28,
    type: "utility",
  },
  {
    name: "Vidisha Solar",
    state: "Madhya Pradesh",
    capacityMW: 100,
    lat: 23.52,
    lon: 77.81,
    type: "utility",
  },
  {
    name: "Amravati Solar Park",
    state: "Maharashtra",
    capacityMW: 75,
    lat: 20.93,
    lon: 77.75,
    type: "utility",
  },
  {
    name: "Solapur Solar Park",
    state: "Maharashtra",
    capacityMW: 200,
    lat: 17.69,
    lon: 75.91,
    type: "utility",
  },
  {
    name: "Latur Solar",
    state: "Maharashtra",
    capacityMW: 100,
    lat: 18.4,
    lon: 76.56,
    type: "utility",
  },
  {
    name: "Dhule Solar",
    state: "Maharashtra",
    capacityMW: 75,
    lat: 20.9,
    lon: 74.77,
    type: "utility",
  },
  {
    name: "Akola Solar",
    state: "Maharashtra",
    capacityMW: 50,
    lat: 20.71,
    lon: 77.0,
    type: "utility",
  },
  {
    name: "Puri Solar Plant",
    state: "Odisha",
    capacityMW: 50,
    lat: 19.81,
    lon: 85.83,
    type: "utility",
  },
  {
    name: "Bolangir Solar",
    state: "Odisha",
    capacityMW: 75,
    lat: 20.7,
    lon: 83.48,
    type: "utility",
  },
  {
    name: "Rourkela Solar",
    state: "Odisha",
    capacityMW: 50,
    lat: 22.26,
    lon: 84.87,
    type: "utility",
  },
  {
    name: "Giridih Solar",
    state: "Jharkhand",
    capacityMW: 50,
    lat: 24.19,
    lon: 86.3,
    type: "utility",
  },
  {
    name: "Hazaribagh Solar",
    state: "Jharkhand",
    capacityMW: 50,
    lat: 23.99,
    lon: 85.36,
    type: "utility",
  },
  {
    name: "Purnia Solar",
    state: "Bihar",
    capacityMW: 50,
    lat: 25.78,
    lon: 87.47,
    type: "utility",
  },
  {
    name: "Gaya Solar",
    state: "Bihar",
    capacityMW: 75,
    lat: 24.8,
    lon: 85.0,
    type: "utility",
  },
  {
    name: "Muzaffarpur Solar",
    state: "Bihar",
    capacityMW: 50,
    lat: 26.12,
    lon: 85.39,
    type: "utility",
  },
  // Punjab
  {
    name: "Muktsar Solar Park",
    state: "Punjab",
    capacityMW: 200,
    lat: 30.47,
    lon: 74.52,
    type: "utility",
  },
  {
    name: "Fazilka Solar Plant",
    state: "Punjab",
    capacityMW: 150,
    lat: 30.4,
    lon: 74.03,
    type: "utility",
  },
  {
    name: "Gurdaspur Solar",
    state: "Punjab",
    capacityMW: 100,
    lat: 32.04,
    lon: 75.4,
    type: "utility",
  },
  // Haryana
  {
    name: "Fatehabad Solar Park",
    state: "Haryana",
    capacityMW: 300,
    lat: 29.51,
    lon: 75.45,
    type: "utility",
  },
  {
    name: "Sirsa Solar Plant",
    state: "Haryana",
    capacityMW: 200,
    lat: 29.53,
    lon: 75.02,
    type: "utility",
  },
  {
    name: "Bhiwani Solar",
    state: "Haryana",
    capacityMW: 100,
    lat: 28.78,
    lon: 76.14,
    type: "utility",
  },
  // Himachal Pradesh
  {
    name: "Spiti Valley Solar",
    state: "Himachal Pradesh",
    capacityMW: 50,
    lat: 32.25,
    lon: 78.07,
    type: "utility",
  },
  {
    name: "Una Solar Park",
    state: "Himachal Pradesh",
    capacityMW: 75,
    lat: 31.47,
    lon: 76.27,
    type: "utility",
  },
  {
    name: "Kangra Solar",
    state: "Himachal Pradesh",
    capacityMW: 30,
    lat: 32.09,
    lon: 76.27,
    type: "utility",
  },
  // Uttarakhand
  {
    name: "Dehradun Solar Park",
    state: "Uttarakhand",
    capacityMW: 50,
    lat: 30.32,
    lon: 78.03,
    type: "utility",
  },
  {
    name: "Haridwar Solar",
    state: "Uttarakhand",
    capacityMW: 75,
    lat: 29.95,
    lon: 78.16,
    type: "utility",
  },
  // Chhattisgarh
  {
    name: "Raipur Solar Park",
    state: "Chhattisgarh",
    capacityMW: 100,
    lat: 21.25,
    lon: 81.63,
    type: "utility",
  },
  {
    name: "Bilaspur Solar",
    state: "Chhattisgarh",
    capacityMW: 75,
    lat: 22.09,
    lon: 82.15,
    type: "utility",
  },
  {
    name: "Korba Solar",
    state: "Chhattisgarh",
    capacityMW: 50,
    lat: 22.36,
    lon: 82.7,
    type: "utility",
  },
  // West Bengal
  {
    name: "Bankura Solar Park",
    state: "West Bengal",
    capacityMW: 50,
    lat: 23.23,
    lon: 87.07,
    type: "utility",
  },
  {
    name: "Purulia Solar",
    state: "West Bengal",
    capacityMW: 75,
    lat: 23.33,
    lon: 86.37,
    type: "utility",
  },
  // Assam
  {
    name: "Tezpur Solar Park",
    state: "Assam",
    capacityMW: 50,
    lat: 26.64,
    lon: 92.79,
    type: "utility",
  },
  {
    name: "Jorhat Solar",
    state: "Assam",
    capacityMW: 30,
    lat: 26.75,
    lon: 94.2,
    type: "utility",
  },
  // Goa
  {
    name: "Goa Solar Rooftop",
    state: "Goa",
    capacityMW: 20,
    lat: 15.49,
    lon: 73.82,
    type: "rooftop",
  },
  // Jammu & Kashmir
  {
    name: "Kargil Solar Plant",
    state: "Jammu & Kashmir",
    capacityMW: 50,
    lat: 34.56,
    lon: 76.13,
    type: "utility",
  },
  {
    name: "Kathua Solar",
    state: "Jammu & Kashmir",
    capacityMW: 75,
    lat: 32.39,
    lon: 75.52,
    type: "utility",
  },
  // Ladakh
  {
    name: "Leh Solar Park",
    state: "Ladakh",
    capacityMW: 23,
    lat: 34.16,
    lon: 77.58,
    type: "utility",
  },
  {
    name: "Nubra Solar",
    state: "Ladakh",
    capacityMW: 15,
    lat: 34.53,
    lon: 77.55,
    type: "utility",
  },
  // Tripura
  {
    name: "Agartala Solar Park",
    state: "Tripura",
    capacityMW: 25,
    lat: 23.84,
    lon: 91.28,
    type: "utility",
  },
  // Manipur
  {
    name: "Imphal Solar",
    state: "Manipur",
    capacityMW: 30,
    lat: 24.81,
    lon: 93.94,
    type: "utility",
  },
  // Nagaland
  {
    name: "Dimapur Solar",
    state: "Nagaland",
    capacityMW: 15,
    lat: 25.91,
    lon: 93.72,
    type: "utility",
  },
  // Sikkim
  {
    name: "Gangtok Solar",
    state: "Sikkim",
    capacityMW: 10,
    lat: 27.33,
    lon: 88.61,
    type: "utility",
  },
  // Arunachal Pradesh
  {
    name: "Itanagar Solar",
    state: "Arunachal Pradesh",
    capacityMW: 20,
    lat: 27.08,
    lon: 93.61,
    type: "utility",
  },
  // Meghalaya
  {
    name: "Shillong Solar",
    state: "Meghalaya",
    capacityMW: 20,
    lat: 25.57,
    lon: 91.88,
    type: "utility",
  },
  // More Rajasthan
  {
    name: "Jalore Solar Park",
    state: "Rajasthan",
    capacityMW: 300,
    lat: 25.35,
    lon: 72.62,
    type: "utility",
  },
  {
    name: "Churu Solar",
    state: "Rajasthan",
    capacityMW: 200,
    lat: 28.3,
    lon: 74.97,
    type: "utility",
  },
  // More Gujarat
  {
    name: "Surendranagar Solar",
    state: "Gujarat",
    capacityMW: 200,
    lat: 22.73,
    lon: 71.64,
    type: "utility",
  },
  {
    name: "Banaskantha Solar",
    state: "Gujarat",
    capacityMW: 300,
    lat: 24.17,
    lon: 72.43,
    type: "utility",
  },
  // More Karnataka
  {
    name: "Chitradurga Solar",
    state: "Karnataka",
    capacityMW: 150,
    lat: 14.23,
    lon: 76.4,
    type: "utility",
  },
  // More Andhra Pradesh
  {
    name: "Prakasam Solar Park",
    state: "Andhra Pradesh",
    capacityMW: 250,
    lat: 15.33,
    lon: 79.62,
    type: "utility",
  },
  // More Tamil Nadu
  {
    name: "Thoothukudi Solar",
    state: "Tamil Nadu",
    capacityMW: 150,
    lat: 8.8,
    lon: 78.13,
    type: "utility",
  },
  // More Telangana
  {
    name: "Karimnagar Solar",
    state: "Telangana",
    capacityMW: 100,
    lat: 18.43,
    lon: 79.13,
    type: "utility",
  },
  // More Maharashtra
  {
    name: "Nanded Solar",
    state: "Maharashtra",
    capacityMW: 100,
    lat: 19.15,
    lon: 77.32,
    type: "utility",
  },
  // More Madhya Pradesh
  {
    name: "Betul Solar Park",
    state: "Madhya Pradesh",
    capacityMW: 150,
    lat: 21.91,
    lon: 77.9,
    type: "utility",
  },
  // More Uttar Pradesh
  {
    name: "Bundelkhand Solar",
    state: "Uttar Pradesh",
    capacityMW: 300,
    lat: 25.55,
    lon: 79.55,
    type: "utility",
  },
  // Jharkhand
  {
    name: "Dhanbad Solar",
    state: "Jharkhand",
    capacityMW: 50,
    lat: 23.8,
    lon: 86.45,
    type: "utility",
  },
  // Bihar
  {
    name: "Patna Solar",
    state: "Bihar",
    capacityMW: 75,
    lat: 25.59,
    lon: 85.14,
    type: "utility",
  },
  // Odisha
  {
    name: "Sundargarh Solar",
    state: "Odisha",
    capacityMW: 100,
    lat: 22.12,
    lon: 84.03,
    type: "utility",
  },
];

// India bounds for equirectangular projection
const INDIA_LAT_MIN = 6;
const INDIA_LAT_MAX = 37;
const INDIA_LON_MIN = 68;
const INDIA_LON_MAX = 98;

// Simplified India outline SVG path (equirectangular, normalized 0-1)
// Points derived from approximate India boundary at low resolution
const INDIA_PATH = `
  M 0.537 0.006
  L 0.573 0.013
  L 0.620 0.010
  L 0.657 0.026
  L 0.693 0.010
  L 0.733 0.000
  L 0.790 0.019
  L 0.840 0.055
  L 0.873 0.065
  L 0.913 0.052
  L 0.950 0.071
  L 1.000 0.100
  L 0.983 0.135
  L 0.957 0.148
  L 0.953 0.190
  L 0.940 0.223
  L 0.960 0.265
  L 0.967 0.310
  L 0.990 0.342
  L 1.000 0.387
  L 0.983 0.413
  L 0.960 0.406
  L 0.933 0.432
  L 0.923 0.471
  L 0.933 0.506
  L 0.960 0.535
  L 0.953 0.568
  L 0.923 0.587
  L 0.887 0.568
  L 0.860 0.590
  L 0.843 0.629
  L 0.813 0.652
  L 0.790 0.700
  L 0.757 0.729
  L 0.733 0.787
  L 0.710 0.819
  L 0.680 0.852
  L 0.643 0.877
  L 0.617 0.916
  L 0.590 0.955
  L 0.570 1.000
  L 0.557 0.968
  L 0.543 0.929
  L 0.517 0.890
  L 0.493 0.855
  L 0.463 0.832
  L 0.437 0.784
  L 0.413 0.742
  L 0.393 0.703
  L 0.377 0.658
  L 0.363 0.610
  L 0.340 0.581
  L 0.317 0.552
  L 0.293 0.516
  L 0.270 0.481
  L 0.243 0.448
  L 0.213 0.426
  L 0.187 0.394
  L 0.157 0.358
  L 0.127 0.316
  L 0.103 0.284
  L 0.083 0.245
  L 0.063 0.206
  L 0.043 0.168
  L 0.027 0.132
  L 0.010 0.100
  L 0.000 0.065
  L 0.020 0.035
  L 0.060 0.016
  L 0.097 0.019
  L 0.133 0.010
  L 0.170 0.006
  L 0.210 0.016
  L 0.253 0.006
  L 0.300 0.000
  L 0.343 0.013
  L 0.383 0.006
  L 0.430 0.013
  L 0.480 0.003
  Z
`.trim();

function getPlantDotSize(capacityMW: number): number {
  if (capacityMW >= 5000) return 12;
  if (capacityMW >= 2000) return 10;
  if (capacityMW >= 1000) return 8;
  if (capacityMW >= 500) return 6;
  if (capacityMW >= 200) return 5;
  if (capacityMW >= 100) return 4;
  return 3;
}

function latLonToSvg(lat: number, lon: number, width: number, height: number) {
  const x = ((lon - INDIA_LON_MIN) / (INDIA_LON_MAX - INDIA_LON_MIN)) * width;
  // Latitude increases upward, SVG y increases downward
  const y = ((INDIA_LAT_MAX - lat) / (INDIA_LAT_MAX - INDIA_LAT_MIN)) * height;
  return { x, y };
}

const STATE_COLORS: Record<string, string> = {
  Rajasthan: "#d4aa30",
  Gujarat: "#e07030",
  "Madhya Pradesh": "#50c878",
  Karnataka: "#40c0d0",
  "Andhra Pradesh": "#9060d0",
  "Tamil Nadu": "#c04060",
  Maharashtra: "#408060",
  Telangana: "#d06040",
  "Uttar Pradesh": "#60a0d0",
  Odisha: "#a0c040",
  Jharkhand: "#d08060",
  Bihar: "#80a060",
  Kerala: "#60d0a0",
  Punjab: "#7c6fa0",
  Haryana: "#c0894a",
  "Himachal Pradesh": "#6ab0d0",
  Uttarakhand: "#5da080",
  Chhattisgarh: "#e08870",
  "West Bengal": "#7090c0",
  Assam: "#80b060",
  Goa: "#40b090",
  "Jammu & Kashmir": "#9090d0",
  Ladakh: "#c0b060",
  Tripura: "#b07080",
  Manipur: "#70c0b0",
  Nagaland: "#d0a060",
  Sikkim: "#60b080",
  "Arunachal Pradesh": "#d07060",
  Meghalaya: "#9060c0",
};

function getStateColor(state: string): string {
  return STATE_COLORS[state] ?? "#d4aa30";
}

function getEfficiencyTips(plant: SolarPlant): string[] {
  const state = plant.state;
  const baseTips = [
    "Schedule monthly panel cleaning — dust and grime reduce output by 5–15%.",
    "Inspect all wiring and junction boxes quarterly for corrosion or loose connections.",
    "Monitor the inverter daily via its display or app for fault codes.",
    "Keep a logbook of daily energy output to spot sudden drops.",
    "Ensure no new shading sources (trees, structures) have appeared near the array.",
  ];
  const stateTips: Record<string, string[]> = {
    Rajasthan: [
      "High desert dust requires panel cleaning every 2–3 weeks, especially Apr–Jun.",
      "Install anti-soiling nano-coatings on panel glass to repel dust.",
      "Use bifacial panels to capture albedo from sandy terrain.",
      "Check mounting frames for sand erosion and re-tighten bolts after dust storms.",
      "Consider tracker systems — tracking can boost yield 20–30% in strong irradiance zones.",
    ],
    Gujarat: [
      "Cyclone season (May–Jun, Oct–Nov): inspect and secure all panel clamps and mounting bolts before the season.",
      "Coastal areas: apply anti-salt-spray coatings on frames and wiring conduits.",
      "High irradiance zone — perform thermal imaging annually to detect hot spots.",
      "Khavda/Kutch region: check for sand abrasion on panel surfaces every 6 months.",
    ],
    Karnataka: [
      "Bi-annual cleaning sufficient for most sites, but increase to monthly during Mar–May (dry season).",
      "Inspect for bird droppings — prevalent in Bellary and Koppal; install bird-deterrent spikes.",
      "Pavagada area has mild temperatures — ensure inverter ventilation is not blocked.",
    ],
    "Tamil Nadu": [
      "Pre-monsoon cleaning (May) is critical before Jun–Sep rains reduce cleaning frequency.",
      "Install surge protectors — coastal thunderstorm activity is significant.",
      "High humidity: check all cable glands and connectors for water ingress quarterly.",
      "Bird fouling is common near Kamuthi; schedule weekly cleaning during nesting season.",
    ],
    "Andhra Pradesh": [
      "Cyclone-prone coast (Oct–Dec): ensure all arrays are rated for 150+ km/h wind loads.",
      "Post-cyclone inspection is mandatory — check for any panel micro-cracks.",
      "Install bird deterrents in Kurnool and Kadapa sites.",
    ],
    Maharashtra: [
      "Pre-monsoon (May) cleaning recommended; monsoon (Jun–Sep) self-cleans panels.",
      "High humidity in Vidarbha: check for rust on non-stainless steel fasteners annually.",
      "Solapur and Dhule: high temperatures in summer (>40°C) — check inverter cooling.",
    ],
    "Madhya Pradesh": [
      "Clean panels monthly during Feb–May (peak dust and pollen season).",
      "Rewa area experiences good insolation — maximise tracking if infrastructure allows.",
      "Inspect cable insulation after monsoon for rodent damage.",
    ],
    Kerala: [
      "Heavy monsoon (Jun–Aug): clean panels before and after monsoon season.",
      "High humidity: use marine-grade connectors and stainless-steel hardware.",
      "Coconut tree shading can be significant — conduct annual shading analysis.",
    ],
    Telangana: [
      "High ambient temperatures in summer — ensure inverter rooms are well-ventilated.",
      "Clean panels every 3–4 weeks during hot, dry months (Feb–May).",
      "Install ground-mounted bird deterrents at Mahabubnagar sites.",
    ],
    "Uttar Pradesh": [
      "Winter fog (Dec–Jan) at some northern sites can reduce output 10–20% — plan for this in annual forecasts.",
      "Spring (Feb–Apr) brings high dust — schedule monthly cleaning.",
      "Mirzapur and Bundelkhand area: check cable earthing after monsoon.",
    ],
    Odisha: [
      "Cyclone risk (Oct–Nov): secure all loose components before the season.",
      "Post-cyclone: full visual inspection for panel displacement or damage.",
      "Clean monthly during Feb–May; rain self-cleans Jun–Sep.",
    ],
    Jharkhand: [
      "High humidity and forest surroundings mean increased bird fouling — clean bi-weekly.",
      "Inspect grounding systems after every monsoon season.",
    ],
    Bihar: [
      "Winter fog (Dec–Jan) reduces output — monitor closely.",
      "Post-monsoon inspection for silting around mounting structures.",
    ],
    Punjab: [
      "Install anti-bird mesh near inverter ventilation openings.",
      "Winter smog (Nov–Jan): schedule cleaning after clear weather spells.",
      "Dust from agriculture during harvest seasons (Apr, Oct) — increase cleaning frequency.",
    ],
    Haryana: [
      "Agricultural dust during harvest (Apr, Oct) — clean panels every 2 weeks.",
      "Winter fog: annual yield adjustment for Dec–Jan fog months.",
      "Ensure mounting structures can handle strong Loo winds in May–Jun.",
    ],
    "Himachal Pradesh": [
      "Snow load is a primary risk — install panels at steep tilt (>45°) to allow snow slide-off.",
      "Snow clearing: brush panels after every snowfall, avoid metal tools that scratch glass.",
      "High altitude UV — use UV-stabilised backsheet panels for longevity.",
      "Inspect foundations after freeze-thaw cycles each spring.",
    ],
    Uttarakhand: [
      "Snow on panels: use heated modules or steep tilt angles in Dehradun/Haridwar winter.",
      "Landslide/debris risk in hilly terrain: annual foundation check is mandatory.",
      "High UV at altitude — ensure frame anodisation is intact.",
    ],
    Chhattisgarh: [
      "Good irradiance in Raipur region — keep soiling factor calibrated.",
      "Check for vegetation intrusion under panels quarterly.",
      "Monsoon (Jun–Sep) is self-cleaning; clean panels thoroughly in May.",
    ],
    "West Bengal": [
      "Pre-monsoon cleaning is critical; Purulia zone is dusty before rains.",
      "High humidity: regular connector inspections for corrosion.",
      "Cyclone risk in southern areas (Oct–Nov): secure mounting hardware.",
    ],
    Assam: [
      "Very high rainfall region — panels are self-cleaned but check structural drainage.",
      "High humidity and biological growth (algae/moss): apply anti-algae coatings to panel frames.",
      "Earthquake zone: inspect structural bolts for loosening annually.",
    ],
    Goa: [
      "High humidity and coastal salt spray: use marine-grade aluminium frames.",
      "Pre-monsoon cleaning essential (May) — monsoon heavy rains clean effectively.",
      "Corrosion is the biggest long-term risk — annual frame inspection mandatory.",
    ],
    "Jammu & Kashmir": [
      "Snow clearing after every fall; use telescopic brushes for rooftop arrays.",
      "Check battery storage systems (if any) for freeze protection below -10°C.",
      "Summer irradiance is excellent in Kargil valley — maximise tilt for winter output.",
    ],
    Ladakh: [
      "Highest priority: snow clearing — panels can be buried for days.",
      "Extreme temperature swings (-20°C to +30°C): use panels with wide operating range.",
      "UV radiation is extreme at 3500m+: inspect back sheets annually for degradation.",
      "Very low humidity means minimal corrosion but high soiling from wind-blown sand.",
    ],
    Tripura: [
      "High rainfall — good self-cleaning; focus on structural corrosion prevention.",
      "Seismic activity: annual foundation and mounting bolt inspection.",
    ],
    Manipur: [
      "High rainfall: ensure drainage around mounting foundations is unobstructed.",
      "Clean panels in dry months (Nov–Feb) when rainfall decreases.",
    ],
    Nagaland: [
      "Dense vegetation nearby: schedule quarterly inspection for shading from tree growth.",
      "High rainfall self-cleans panels; focus on preventing moss buildup on frames.",
    ],
    Sikkim: [
      "Snow and ice loading is significant — use steep tilt and snow guards.",
      "Landslide risk: inspect foundation and cable run-offs after heavy monsoon.",
    ],
    "Arunachal Pradesh": [
      "Very high rainfall — inspect cable glands and all waterproofing quarterly.",
      "Dense forest environment: annual shading analysis as trees grow.",
    ],
    Meghalaya: [
      "Wettest region in India — waterproofing and drainage are the top priorities.",
      "Algae and moss growth on frames is common; use zinc-coated or stainless hardware.",
      "Clean panels quarterly in dry windows (Nov–Feb).",
    ],
  };
  return [...(stateTips[state] ?? []), ...baseTips];
}

const ALL_STATES = Array.from(new Set(SOLAR_PLANTS.map((p) => p.state))).sort();

export function IndiaSolarPlants({
  onSelectLocation,
  currentLat,
  currentLon,
}: IndiaSolarPlantsProps) {
  const [search, setSearch] = useState("");
  const [selectedState, setSelectedState] = useState<string>("All");
  const [selectedType, setSelectedType] = useState<
    "all" | "utility" | "rooftop"
  >("all");
  const [hoveredPlant, setHoveredPlant] = useState<string | null>(null);
  const [selectedPlant, setSelectedPlant] = useState<string | null>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const filtered = useMemo(() => {
    return SOLAR_PLANTS.filter((p) => {
      const matchSearch =
        search.length < 2 ||
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.state.toLowerCase().includes(search.toLowerCase());
      const matchState = selectedState === "All" || p.state === selectedState;
      const matchType = selectedType === "all" || p.type === selectedType;
      return matchSearch && matchState && matchType;
    });
  }, [search, selectedState, selectedType]);

  const totalCapacity = useMemo(
    () => filtered.reduce((s, p) => s + p.capacityMW, 0),
    [filtered],
  );

  const SVG_W = 340;
  const SVG_H = 400;

  function handleSelect(plant: SolarPlant) {
    setSelectedPlant(plant.name);
    onSelectLocation(plant.lat, plant.lon, `${plant.name}, ${plant.state}`);
    toast.success(`Location set to ${plant.name}`);
  }

  // Check if a plant is near current config location
  function isCurrentLocation(plant: SolarPlant): boolean {
    return (
      Math.abs(plant.lat - currentLat) < 0.15 &&
      Math.abs(plant.lon - currentLon) < 0.15
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="space-y-4 pb-8"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold font-display text-foreground flex items-center gap-2">
            <Sun className="w-5 h-5 text-solar-gold" />
            India Solar Plant Directory
          </h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            Click any plant to load its location into the solar forecast engine
          </p>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="card-solar rounded-xl p-3 text-center">
          <div className="text-2xl font-bold font-display text-solar-gold">
            {filtered.length}
          </div>
          <div className="text-xs text-muted-foreground uppercase tracking-wider mt-1">
            Plants Shown
          </div>
        </div>
        <div className="card-solar rounded-xl p-3 text-center">
          <div className="text-2xl font-bold font-display text-solar-teal">
            {totalCapacity >= 1000
              ? `${(totalCapacity / 1000).toFixed(1)} GW`
              : `${totalCapacity.toLocaleString()} MW`}
          </div>
          <div className="text-xs text-muted-foreground uppercase tracking-wider mt-1">
            Total Capacity
          </div>
        </div>
        <div className="card-solar rounded-xl p-3 text-center">
          <div className="text-2xl font-bold font-display text-solar-green">
            {ALL_STATES.length}
          </div>
          <div className="text-xs text-muted-foreground uppercase tracking-wider mt-1">
            States Covered
          </div>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="card-solar rounded-xl p-4 space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            data-ocid="solarplants.search_input"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search plants or states..."
            className="pl-9 bg-secondary border-border"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {/* Type filter */}
          {(["all", "utility", "rooftop"] as const).map((t) => (
            <button
              key={t}
              type="button"
              data-ocid={`solarplants.${t}.tab`}
              onClick={() => setSelectedType(t)}
              className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors capitalize ${
                selectedType === t
                  ? "bg-solar-gold text-background"
                  : "bg-muted/30 text-muted-foreground hover:text-foreground"
              }`}
            >
              {t === "all"
                ? "All Types"
                : t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
          <div className="w-px bg-border mx-1" />
          {/* State filter */}
          <button
            type="button"
            data-ocid="solarplants.all_states.tab"
            onClick={() => setSelectedState("All")}
            className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors ${
              selectedState === "All"
                ? "bg-solar-teal text-background"
                : "bg-muted/30 text-muted-foreground hover:text-foreground"
            }`}
          >
            All States
          </button>
          {ALL_STATES.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setSelectedState(s === selectedState ? "All" : s)}
              className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors ${
                selectedState === s
                  ? "text-background"
                  : "bg-muted/30 text-muted-foreground hover:text-foreground"
              }`}
              style={
                selectedState === s
                  ? { background: getStateColor(s) }
                  : undefined
              }
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content: List + Map */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Plant Cards List */}
        <div className="card-solar rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-border flex items-center justify-between">
            <span className="text-sm font-semibold text-muted-foreground uppercase tracking-widest">
              Plant List
            </span>
            <span className="text-xs text-muted-foreground">
              {filtered.length} results
            </span>
          </div>
          <ScrollArea className="h-[520px]">
            <div ref={listRef} className="p-2 space-y-2">
              {filtered.length === 0 && (
                <div
                  data-ocid="solarplants.empty_state"
                  className="py-12 text-center text-muted-foreground text-sm"
                >
                  No plants match your search.
                </div>
              )}
              {filtered.map((plant, idx) => {
                const isCurrent = isCurrentLocation(plant);
                const isSelected = selectedPlant === plant.name || isCurrent;
                const color = getStateColor(plant.state);
                return (
                  <motion.div
                    key={plant.name}
                    data-ocid={`solarplants.item.${idx + 1}`}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: Math.min(idx * 0.02, 0.4) }}
                    onMouseEnter={() => setHoveredPlant(plant.name)}
                    onMouseLeave={() => setHoveredPlant(null)}
                    className={`rounded-lg border transition-all duration-150 ${
                      isSelected
                        ? "border-solar-gold bg-solar-gold/10"
                        : hoveredPlant === plant.name
                          ? "border-border bg-muted/30"
                          : "border-border/50 bg-muted/10"
                    }`}
                  >
                    <div className="p-3">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-sm text-foreground truncate">
                            {plant.name}
                          </div>
                          <div
                            className="text-xs mt-0.5 font-medium"
                            style={{ color }}
                          >
                            {plant.state}
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-1 flex-shrink-0">
                          <Badge
                            variant="outline"
                            className="text-xs border-solar-gold/40 text-solar-gold font-mono"
                          >
                            <Zap className="w-2.5 h-2.5 mr-1" />
                            {plant.capacityMW >= 1000
                              ? `${(plant.capacityMW / 1000).toFixed(1)} GW`
                              : `${plant.capacityMW} MW`}
                          </Badge>
                          <Badge
                            variant="outline"
                            className={`text-xs ${
                              plant.type === "rooftop"
                                ? "border-solar-teal/40 text-solar-teal"
                                : "border-border text-muted-foreground"
                            }`}
                          >
                            {plant.type}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1 text-xs text-muted-foreground font-mono">
                          <MapPin className="w-3 h-3" />
                          {plant.lat.toFixed(2)}°N, {plant.lon.toFixed(2)}°E
                        </div>
                        <Button
                          data-ocid={`solarplants.item.${idx + 1}.button`}
                          size="sm"
                          onClick={() => handleSelect(plant)}
                          className={`text-xs h-7 px-3 ${
                            isSelected
                              ? "gradient-solar text-primary-foreground"
                              : "border-solar-gold/60 text-solar-gold hover:bg-solar-gold/10"
                          }`}
                          variant={isSelected ? "default" : "outline"}
                        >
                          {isSelected ? "✓ Active" : "Load Location"}
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </ScrollArea>
        </div>

        {/* SVG India Map */}
        <div className="card-solar rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-border flex items-center justify-between">
            <span className="text-sm font-semibold text-muted-foreground uppercase tracking-widest">
              India Solar Map
            </span>
            <span className="text-xs text-muted-foreground">
              Dot size = capacity
            </span>
          </div>
          <div className="p-4 flex items-center justify-center bg-muted/5">
            <svg
              data-ocid="solarplants.canvas_target"
              viewBox={`0 0 ${SVG_W} ${SVG_H}`}
              width="100%"
              style={{ maxHeight: 520, minHeight: 300 }}
              className="select-none"
              role="img"
              aria-label="India solar plant map"
            >
              {/* India map background */}
              <defs>
                <radialGradient id="mapGrad" cx="50%" cy="50%" r="60%">
                  <stop offset="0%" stopColor="oklch(0.18 0.02 250)" />
                  <stop offset="100%" stopColor="oklch(0.12 0.015 250)" />
                </radialGradient>
                <filter id="glow">
                  <feGaussianBlur stdDeviation="2" result="coloredBlur" />
                  <feMerge>
                    <feMergeNode in="coloredBlur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>

              {/* Background */}
              <rect
                width={SVG_W}
                height={SVG_H}
                fill="oklch(0.12 0.015 250)"
                rx="8"
              />

              {/* India outline using scaled path */}
              <g transform={`scale(${SVG_W}, ${SVG_H})`}>
                <path
                  d={INDIA_PATH}
                  fill="oklch(0.18 0.022 250)"
                  stroke="oklch(0.35 0.03 240)"
                  strokeWidth="0.003"
                  strokeLinejoin="round"
                />
              </g>

              {/* Grid lines (lat/lon) */}
              {[10, 15, 20, 25, 30, 35].map((lat) => {
                const { y } = latLonToSvg(lat, INDIA_LON_MIN, SVG_W, SVG_H);
                return (
                  <g key={`lat-${lat}`}>
                    <line
                      x1={0}
                      y1={y}
                      x2={SVG_W}
                      y2={y}
                      stroke="oklch(0.28 0.02 240)"
                      strokeWidth="0.5"
                      strokeDasharray="3 4"
                      opacity={0.5}
                    />
                    <text
                      x={3}
                      y={y - 2}
                      fontSize="7"
                      fill="oklch(0.45 0.02 240)"
                    >
                      {lat}°N
                    </text>
                  </g>
                );
              })}
              {[70, 75, 80, 85, 90, 95].map((lon) => {
                const { x } = latLonToSvg(INDIA_LAT_MAX, lon, SVG_W, SVG_H);
                return (
                  <g key={`lon-${lon}`}>
                    <line
                      x1={x}
                      y1={0}
                      x2={x}
                      y2={SVG_H}
                      stroke="oklch(0.28 0.02 240)"
                      strokeWidth="0.5"
                      strokeDasharray="3 4"
                      opacity={0.5}
                    />
                    <text
                      x={x + 2}
                      y={SVG_H - 3}
                      fontSize="7"
                      fill="oklch(0.45 0.02 240)"
                    >
                      {lon}°E
                    </text>
                  </g>
                );
              })}

              {/* Solar plant dots */}
              {SOLAR_PLANTS.filter((p) => {
                const matchSearch =
                  search.length < 2 ||
                  p.name.toLowerCase().includes(search.toLowerCase()) ||
                  p.state.toLowerCase().includes(search.toLowerCase());
                const matchState =
                  selectedState === "All" || p.state === selectedState;
                const matchType =
                  selectedType === "all" || p.type === selectedType;
                return matchSearch && matchState && matchType;
              }).map((plant) => {
                const { x, y } = latLonToSvg(
                  plant.lat,
                  plant.lon,
                  SVG_W,
                  SVG_H,
                );
                const r = getPlantDotSize(plant.capacityMW);
                const color = getStateColor(plant.state);
                const isHovered = hoveredPlant === plant.name;
                const isCurrent = isCurrentLocation(plant);
                const isSelected2 = selectedPlant === plant.name || isCurrent;
                return (
                  <g
                    key={plant.name}
                    style={{ cursor: "pointer" }}
                    onMouseEnter={() => setHoveredPlant(plant.name)}
                    onMouseLeave={() => setHoveredPlant(null)}
                    onClick={() => handleSelect(plant)}
                    aria-label={`Select ${plant.name}`}
                    tabIndex={0}
                    onKeyDown={(e) => e.key === "Enter" && handleSelect(plant)}
                  >
                    {/* Glow ring for selected/hovered */}
                    {(isHovered || isSelected2) && (
                      <circle
                        cx={x}
                        cy={y}
                        r={r + 4}
                        fill="none"
                        stroke={isSelected2 ? "#d4aa30" : color}
                        strokeWidth="1.5"
                        opacity={0.7}
                        filter="url(#glow)"
                      />
                    )}
                    <circle
                      cx={x}
                      cy={y}
                      r={isHovered ? r + 2 : r}
                      fill={isSelected2 ? "#d4aa30" : color}
                      opacity={isHovered ? 1 : 0.82}
                      style={{ transition: "r 0.15s ease" }}
                    />
                    {/* Label on hover */}
                    {isHovered && (
                      <>
                        <rect
                          x={x + r + 3}
                          y={y - 10}
                          width={Math.min(plant.name.length * 5.5, 130)}
                          height={20}
                          fill="oklch(0.14 0.02 250)"
                          stroke="oklch(0.3 0.025 240)"
                          strokeWidth="0.7"
                          rx="3"
                          opacity={0.97}
                        />
                        <text
                          x={x + r + 7}
                          y={y + 3}
                          fontSize="8.5"
                          fill="oklch(0.96 0.01 220)"
                          fontWeight="600"
                        >
                          {plant.name.length > 22
                            ? `${plant.name.slice(0, 22)}…`
                            : plant.name}
                        </text>
                      </>
                    )}
                  </g>
                );
              })}

              {/* Current active location marker (cross-hair) */}
              {(() => {
                const { x, y } = latLonToSvg(
                  currentLat,
                  currentLon,
                  SVG_W,
                  SVG_H,
                );
                if (x < 0 || x > SVG_W || y < 0 || y > SVG_H) return null;
                return (
                  <g>
                    <line
                      x1={x - 8}
                      y1={y}
                      x2={x + 8}
                      y2={y}
                      stroke="#d4aa30"
                      strokeWidth="1.5"
                      opacity={0.8}
                    />
                    <line
                      x1={x}
                      y1={y - 8}
                      x2={x}
                      y2={y + 8}
                      stroke="#d4aa30"
                      strokeWidth="1.5"
                      opacity={0.8}
                    />
                    <circle
                      cx={x}
                      cy={y}
                      r={3}
                      fill="none"
                      stroke="#d4aa30"
                      strokeWidth="1.5"
                      opacity={0.9}
                    />
                  </g>
                );
              })()}
            </svg>
          </div>

          {/* Map Legend */}
          <div className="px-4 pb-4">
            <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
              <div className="col-span-2 text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-1">
                Dot Size = Capacity
              </div>
              {[
                { label: "< 100 MW", size: 3 },
                { label: "100–500 MW", size: 5 },
                { label: "500 MW–1 GW", size: 7 },
                { label: "1 GW+", size: 10 },
              ].map(({ label, size }) => (
                <div key={label} className="flex items-center gap-2">
                  <svg width="18" height="18" aria-hidden="true">
                    <circle
                      cx="9"
                      cy="9"
                      r={size / 1.2}
                      fill="#d4aa30"
                      opacity={0.85}
                    />
                  </svg>
                  <span className="text-xs text-muted-foreground">{label}</span>
                </div>
              ))}
              <div className="col-span-2 mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                <svg width="18" height="18" aria-hidden="true">
                  <line
                    x1="4"
                    y1="9"
                    x2="14"
                    y2="9"
                    stroke="#d4aa30"
                    strokeWidth="1.5"
                  />
                  <line
                    x1="9"
                    y1="4"
                    x2="9"
                    y2="14"
                    stroke="#d4aa30"
                    strokeWidth="1.5"
                  />
                  <circle
                    cx="9"
                    cy="9"
                    r="2.5"
                    fill="none"
                    stroke="#d4aa30"
                    strokeWidth="1.5"
                  />
                </svg>
                Current active location
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Efficiency Tips Section */}
      <div
        data-ocid="solarplants.tips.section"
        className="card-solar rounded-xl overflow-hidden"
      >
        <div className="px-4 py-3 border-b border-border flex items-center gap-2">
          <Lightbulb className="w-4 h-4 text-solar-gold" />
          <span className="text-sm font-semibold text-muted-foreground uppercase tracking-widest">
            Efficiency Tips & Precautions
          </span>
          {selectedPlant && (
            <span className="ml-auto text-xs text-solar-gold font-medium">
              {SOLAR_PLANTS.find((p) => p.name === selectedPlant)?.name ??
                selectedPlant}
            </span>
          )}
        </div>
        <div className="p-4">
          {!selectedPlant ? (
            <div className="text-center py-8 text-muted-foreground">
              <Lightbulb className="w-8 h-8 mx-auto mb-2 opacity-30" />
              <p className="text-sm">
                Select a solar plant from the list or map to see specific
                efficiency tips and precautions for that location.
              </p>
            </div>
          ) : (
            (() => {
              const plant = SOLAR_PLANTS.find((p) => p.name === selectedPlant);
              if (!plant) return null;
              const tips = getEfficiencyTips(plant);
              return (
                <div className="space-y-3">
                  <div className="flex items-center gap-3 mb-4 flex-wrap">
                    <div className="bg-solar-gold/10 rounded-lg px-3 py-2">
                      <div className="text-xs text-muted-foreground">State</div>
                      <div className="font-semibold text-solar-gold">
                        {plant.state}
                      </div>
                    </div>
                    <div className="bg-solar-teal/10 rounded-lg px-3 py-2">
                      <div className="text-xs text-muted-foreground">
                        Capacity
                      </div>
                      <div className="font-semibold text-solar-teal">
                        {plant.capacityMW >= 1000
                          ? `${(plant.capacityMW / 1000).toFixed(1)} GW`
                          : `${plant.capacityMW} MW`}
                      </div>
                    </div>
                    <div className="bg-solar-green/10 rounded-lg px-3 py-2">
                      <div className="text-xs text-muted-foreground">Type</div>
                      <div className="font-semibold text-solar-green capitalize">
                        {plant.type}
                      </div>
                    </div>
                  </div>
                  <ul className="space-y-2">
                    {tips.map((tip) => (
                      <li key={tip} className="flex items-start gap-2 text-sm">
                        <span className="text-solar-gold mt-0.5 flex-shrink-0">
                          •
                        </span>
                        <span className="text-foreground/90">{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })()
          )}
        </div>
      </div>
    </motion.div>
  );
}
