import { createFileRoute } from "@tanstack/react-router";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, X, TrendingUp, TrendingDown, Minus, Sparkles, Brain, Clock,
  AlertTriangle, Rocket, Download, Users, MapPin, Activity, ChevronDown,
  Lock, Loader2, Check, Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import type { DateRange } from "react-day-picker";

export const Route = createFileRoute("/dashboard/audience")({
  component: Audience,
  head: () => ({ meta: [{ title: "Audience Intelligence — BrandSync AI" }] }),
});

// ============================================================
// DATA_CONFIG
// ============================================================
type Trend = "up" | "down" | "flat";
type Audience = {
  id: string; name: string;
  category: "Interest" | "Behavioral" | "Demographic" | "Lookalike";
  globalReach: number; trend: Trend; overlapGroups: string[];
};

const AUDIENCES: Audience[] = [
  // Interest
  { id: "fitness", name: "Fitness Enthusiasts", category: "Interest", globalReach: 4_200_000, trend: "up", overlapGroups: ["health", "shoppers"] },
  { id: "newparents", name: "New Parents", category: "Interest", globalReach: 2_800_000, trend: "flat", overlapGroups: ["family"] },
  { id: "tech", name: "Tech Early Adopters", category: "Interest", globalReach: 6_100_000, trend: "up", overlapGroups: ["gamers"] },
  { id: "fashion", name: "Fashion Forward", category: "Interest", globalReach: 3_500_000, trend: "flat", overlapGroups: ["shoppers"] },
  { id: "smb", name: "Small Business Owners", category: "Interest", globalReach: 1_900_000, trend: "up", overlapGroups: ["decision"] },
  { id: "eco", name: "Eco-conscious Consumers", category: "Interest", globalReach: 2_200_000, trend: "up", overlapGroups: ["health"] },
  { id: "gamers", name: "Gamers (18–35)", category: "Interest", globalReach: 8_400_000, trend: "up", overlapGroups: ["gamers", "tech"] },
  { id: "foodies", name: "Foodies & Home Cooks", category: "Interest", globalReach: 3_100_000, trend: "flat", overlapGroups: ["family"] },
  { id: "yoga", name: "Yoga & Meditation", category: "Interest", globalReach: 2_700_000, trend: "up", overlapGroups: ["health"] },
  { id: "crypto", name: "Cryptocurrency Investors", category: "Interest", globalReach: 3_900_000, trend: "up", overlapGroups: ["finance"] },
  { id: "stocks", name: "Stock Market Traders", category: "Interest", globalReach: 2_400_000, trend: "up", overlapGroups: ["finance"] },
  { id: "realestate", name: "Real Estate Investors", category: "Interest", globalReach: 1_500_000, trend: "flat", overlapGroups: ["finance"] },
  { id: "luxurytravel", name: "Luxury Travel", category: "Interest", globalReach: 1_800_000, trend: "up", overlapGroups: ["travel", "hnw"] },
  { id: "budgettravel", name: "Budget Backpackers", category: "Interest", globalReach: 2_900_000, trend: "flat", overlapGroups: ["travel"] },
  { id: "adventure", name: "Adventure & Outdoors", category: "Interest", globalReach: 3_200_000, trend: "up", overlapGroups: ["travel"] },
  { id: "hiking", name: "Hiking & Camping", category: "Interest", globalReach: 2_100_000, trend: "flat", overlapGroups: ["travel"] },
  { id: "running", name: "Runners & Marathoners", category: "Interest", globalReach: 1_900_000, trend: "up", overlapGroups: ["health"] },
  { id: "cycling", name: "Cycling Enthusiasts", category: "Interest", globalReach: 1_700_000, trend: "flat", overlapGroups: ["health"] },
  { id: "vegan", name: "Vegan & Plant-Based", category: "Interest", globalReach: 2_200_000, trend: "up", overlapGroups: ["health", "eco"] },
  { id: "keto", name: "Keto & Low-Carb", category: "Interest", globalReach: 1_600_000, trend: "flat", overlapGroups: ["health"] },
  { id: "coffee", name: "Coffee Connoisseurs", category: "Interest", globalReach: 3_400_000, trend: "flat", overlapGroups: [] },
  { id: "winelovers", name: "Wine Lovers", category: "Interest", globalReach: 1_900_000, trend: "flat", overlapGroups: ["hnw"] },
  { id: "craftbeer", name: "Craft Beer Fans", category: "Interest", globalReach: 1_400_000, trend: "flat", overlapGroups: [] },
  { id: "movies", name: "Movie Buffs", category: "Interest", globalReach: 5_800_000, trend: "flat", overlapGroups: [] },
  { id: "anime", name: "Anime & Manga Fans", category: "Interest", globalReach: 4_100_000, trend: "up", overlapGroups: ["gamers"] },
  { id: "kpop", name: "K-Pop Fans", category: "Interest", globalReach: 3_800_000, trend: "up", overlapGroups: ["young"] },
  { id: "music", name: "Music Producers", category: "Interest", globalReach: 1_200_000, trend: "flat", overlapGroups: [] },
  { id: "podcasts", name: "Podcast Listeners", category: "Interest", globalReach: 4_600_000, trend: "up", overlapGroups: [] },
  { id: "books", name: "Book Readers", category: "Interest", globalReach: 3_300_000, trend: "flat", overlapGroups: [] },
  { id: "photography", name: "Photography Enthusiasts", category: "Interest", globalReach: 2_500_000, trend: "flat", overlapGroups: [] },
  { id: "design", name: "Graphic Designers", category: "Interest", globalReach: 1_700_000, trend: "up", overlapGroups: ["creators"] },
  { id: "creators", name: "Content Creators", category: "Interest", globalReach: 3_900_000, trend: "up", overlapGroups: ["creators"] },
  { id: "youtubers", name: "Aspiring YouTubers", category: "Interest", globalReach: 2_800_000, trend: "up", overlapGroups: ["creators"] },
  { id: "founders", name: "SaaS Founders", category: "Interest", globalReach: 480_000, trend: "up", overlapGroups: ["decision"] },
  { id: "vc", name: "Startup Investors / VCs", category: "Interest", globalReach: 210_000, trend: "flat", overlapGroups: ["decision", "hnw"] },
  { id: "marketing", name: "Digital Marketers", category: "Interest", globalReach: 2_400_000, trend: "up", overlapGroups: ["decision"] },
  { id: "developers", name: "Software Developers", category: "Interest", globalReach: 4_700_000, trend: "up", overlapGroups: ["tech"] },
  { id: "designersui", name: "UI/UX Designers", category: "Interest", globalReach: 1_100_000, trend: "up", overlapGroups: ["tech"] },
  { id: "freelancers", name: "Freelancers & Remote Workers", category: "Interest", globalReach: 3_600_000, trend: "up", overlapGroups: [] },
  { id: "homeowners", name: "Homeowners", category: "Interest", globalReach: 5_200_000, trend: "flat", overlapGroups: [] },
  { id: "diy", name: "DIY & Home Improvement", category: "Interest", globalReach: 2_900_000, trend: "flat", overlapGroups: [] },
  { id: "gardening", name: "Gardening", category: "Interest", globalReach: 2_100_000, trend: "flat", overlapGroups: [] },
  { id: "petowners", name: "Pet Owners", category: "Interest", globalReach: 6_400_000, trend: "flat", overlapGroups: ["family"] },
  { id: "dogowners", name: "Dog Owners", category: "Interest", globalReach: 4_800_000, trend: "flat", overlapGroups: ["family"] },
  { id: "catowners", name: "Cat Owners", category: "Interest", globalReach: 3_200_000, trend: "flat", overlapGroups: ["family"] },
  { id: "weddings", name: "Engaged / Wedding Planning", category: "Interest", globalReach: 980_000, trend: "up", overlapGroups: ["lifeevent"] },
  { id: "expecting", name: "Expecting Parents", category: "Interest", globalReach: 720_000, trend: "up", overlapGroups: ["lifeevent", "family"] },
  { id: "students", name: "College Students", category: "Interest", globalReach: 6_800_000, trend: "flat", overlapGroups: ["young"] },
  { id: "teachers", name: "Teachers & Educators", category: "Interest", globalReach: 2_400_000, trend: "flat", overlapGroups: [] },
  { id: "nurses", name: "Healthcare Workers", category: "Interest", globalReach: 1_900_000, trend: "flat", overlapGroups: [] },
  { id: "lawyers", name: "Legal Professionals", category: "Interest", globalReach: 640_000, trend: "flat", overlapGroups: ["decision"] },
  { id: "doctors", name: "Doctors & Physicians", category: "Interest", globalReach: 580_000, trend: "flat", overlapGroups: ["decision", "hnw"] },
  { id: "engineers", name: "Engineers", category: "Interest", globalReach: 2_700_000, trend: "flat", overlapGroups: ["tech"] },
  { id: "executives", name: "C-Suite Executives", category: "Interest", globalReach: 320_000, trend: "flat", overlapGroups: ["decision", "hnw"] },
  { id: "skincare", name: "Skincare & Beauty", category: "Interest", globalReach: 5_100_000, trend: "up", overlapGroups: ["shoppers"] },
  { id: "makeup", name: "Makeup Enthusiasts", category: "Interest", globalReach: 4_300_000, trend: "up", overlapGroups: ["shoppers"] },
  { id: "haircare", name: "Hair Care Shoppers", category: "Interest", globalReach: 2_600_000, trend: "flat", overlapGroups: ["shoppers"] },
  { id: "sneakerheads", name: "Sneakerheads", category: "Interest", globalReach: 1_500_000, trend: "up", overlapGroups: ["young"] },
  { id: "luxurybrands", name: "Luxury Brand Shoppers", category: "Interest", globalReach: 1_200_000, trend: "up", overlapGroups: ["hnw"] },
  { id: "thrifters", name: "Thrift & Vintage Shoppers", category: "Interest", globalReach: 1_800_000, trend: "up", overlapGroups: ["eco"] },
  { id: "carenthusiasts", name: "Car Enthusiasts", category: "Interest", globalReach: 4_200_000, trend: "flat", overlapGroups: [] },
  { id: "evs", name: "Electric Vehicle Interest", category: "Interest", globalReach: 1_900_000, trend: "up", overlapGroups: ["eco", "tech"] },
  { id: "motorcycles", name: "Motorcycle Riders", category: "Interest", globalReach: 1_600_000, trend: "flat", overlapGroups: [] },
  { id: "football", name: "Football / Soccer Fans", category: "Interest", globalReach: 9_800_000, trend: "flat", overlapGroups: [] },
  { id: "basketball", name: "Basketball Fans", category: "Interest", globalReach: 6_400_000, trend: "flat", overlapGroups: [] },
  { id: "cricket", name: "Cricket Fans", category: "Interest", globalReach: 8_100_000, trend: "up", overlapGroups: [] },
  { id: "esports", name: "Esports Viewers", category: "Interest", globalReach: 3_700_000, trend: "up", overlapGroups: ["gamers", "young"] },
  { id: "mobilegamers", name: "Mobile Gamers", category: "Interest", globalReach: 7_500_000, trend: "up", overlapGroups: ["gamers"] },
  { id: "boardgames", name: "Board Game Hobbyists", category: "Interest", globalReach: 1_100_000, trend: "flat", overlapGroups: [] },
  { id: "diyparents", name: "Working Moms", category: "Interest", globalReach: 3_400_000, trend: "flat", overlapGroups: ["family"] },
  { id: "dads", name: "New Dads", category: "Interest", globalReach: 1_800_000, trend: "flat", overlapGroups: ["family"] },
  { id: "veterans", name: "Military & Veterans", category: "Interest", globalReach: 950_000, trend: "flat", overlapGroups: [] },
  { id: "religious", name: "Faith-Based Communities", category: "Interest", globalReach: 5_600_000, trend: "flat", overlapGroups: [] },
  { id: "spirituality", name: "Spirituality & Astrology", category: "Interest", globalReach: 2_400_000, trend: "up", overlapGroups: [] },
  { id: "minimalism", name: "Minimalism & Decluttering", category: "Interest", globalReach: 1_300_000, trend: "up", overlapGroups: ["eco"] },
  { id: "luxurycars", name: "Luxury Car Buyers", category: "Interest", globalReach: 420_000, trend: "flat", overlapGroups: ["hnw"] },
  { id: "yachting", name: "Boating & Yachting", category: "Interest", globalReach: 280_000, trend: "flat", overlapGroups: ["hnw"] },
  { id: "golf", name: "Golf Enthusiasts", category: "Interest", globalReach: 1_100_000, trend: "flat", overlapGroups: ["hnw"] },
  { id: "tennis", name: "Tennis Players", category: "Interest", globalReach: 890_000, trend: "flat", overlapGroups: [] },
  { id: "surfing", name: "Surfers", category: "Interest", globalReach: 540_000, trend: "flat", overlapGroups: [] },
  { id: "snowsports", name: "Skiing & Snowboarding", category: "Interest", globalReach: 760_000, trend: "flat", overlapGroups: [] },
  { id: "diving", name: "Scuba Diving", category: "Interest", globalReach: 340_000, trend: "flat", overlapGroups: ["travel"] },
  // Behavioral
  { id: "shoppers", name: "Online Shoppers 30d", category: "Behavioral", globalReach: 9_300_000, trend: "up", overlapGroups: ["shoppers"] },
  { id: "highltv", name: "High-LTV Buyers", category: "Behavioral", globalReach: 812_000, trend: "up", overlapGroups: ["shoppers"] },
  { id: "cart", name: "Cart Abandoners", category: "Behavioral", globalReach: 2_100_000, trend: "flat", overlapGroups: ["shoppers"] },
  { id: "app", name: "App Power Users", category: "Behavioral", globalReach: 1_600_000, trend: "up", overlapGroups: [] },
  { id: "price", name: "Price Comparison Visitors", category: "Behavioral", globalReach: 4_400_000, trend: "flat", overlapGroups: ["shoppers"] },
  { id: "video", name: "Video Completers >75%", category: "Behavioral", globalReach: 3_800_000, trend: "up", overlapGroups: [] },
  { id: "frequenttravelers", name: "Frequent Travelers", category: "Behavioral", globalReach: 2_300_000, trend: "up", overlapGroups: ["travel"] },
  { id: "businesstravelers", name: "Business Travelers", category: "Behavioral", globalReach: 1_100_000, trend: "flat", overlapGroups: ["travel", "decision"] },
  { id: "subscribers", name: "Subscription Service Users", category: "Behavioral", globalReach: 5_700_000, trend: "up", overlapGroups: [] },
  { id: "earlyadopters", name: "Tech Early Adopters (Buyers)", category: "Behavioral", globalReach: 980_000, trend: "up", overlapGroups: ["tech"] },
  { id: "deals", name: "Deal & Coupon Seekers", category: "Behavioral", globalReach: 6_200_000, trend: "flat", overlapGroups: ["shoppers"] },
  { id: "luxurybuyers", name: "Luxury Goods Buyers", category: "Behavioral", globalReach: 420_000, trend: "up", overlapGroups: ["hnw"] },
  { id: "donors", name: "Charitable Donors", category: "Behavioral", globalReach: 1_700_000, trend: "flat", overlapGroups: [] },
  { id: "eventgoers", name: "Live Event Attendees", category: "Behavioral", globalReach: 2_900_000, trend: "up", overlapGroups: [] },
  { id: "concertgoers", name: "Concert & Festival Goers", category: "Behavioral", globalReach: 2_100_000, trend: "up", overlapGroups: ["young"] },
  { id: "diners", name: "Frequent Restaurant Diners", category: "Behavioral", globalReach: 4_800_000, trend: "flat", overlapGroups: [] },
  { id: "delivery", name: "Food Delivery Users", category: "Behavioral", globalReach: 5_400_000, trend: "up", overlapGroups: [] },
  { id: "rideshare", name: "Rideshare Users", category: "Behavioral", globalReach: 4_100_000, trend: "flat", overlapGroups: [] },
  { id: "fitnessapp", name: "Fitness App Active Users", category: "Behavioral", globalReach: 1_900_000, trend: "up", overlapGroups: ["health"] },
  { id: "meditationapp", name: "Meditation App Users", category: "Behavioral", globalReach: 820_000, trend: "up", overlapGroups: ["health"] },
  { id: "languagelearners", name: "Language Learners", category: "Behavioral", globalReach: 1_400_000, trend: "up", overlapGroups: [] },
  { id: "onlinecourse", name: "Online Course Buyers", category: "Behavioral", globalReach: 2_200_000, trend: "up", overlapGroups: [] },
  { id: "newsletter", name: "Newsletter Subscribers", category: "Behavioral", globalReach: 3_300_000, trend: "flat", overlapGroups: [] },
  { id: "smarthome", name: "Smart Home Buyers", category: "Behavioral", globalReach: 1_300_000, trend: "up", overlapGroups: ["tech"] },
  { id: "wearables", name: "Wearable Tech Users", category: "Behavioral", globalReach: 1_800_000, trend: "up", overlapGroups: ["tech", "health"] },
  { id: "creditcards", name: "Premium Credit Card Holders", category: "Behavioral", globalReach: 920_000, trend: "flat", overlapGroups: ["hnw"] },
  { id: "investing", name: "Active Investors", category: "Behavioral", globalReach: 1_600_000, trend: "up", overlapGroups: ["finance"] },
  { id: "insurance", name: "Insurance Shoppers", category: "Behavioral", globalReach: 2_400_000, trend: "flat", overlapGroups: [] },
  { id: "homebuyers", name: "Active Home Buyers", category: "Behavioral", globalReach: 680_000, trend: "up", overlapGroups: ["lifeevent"] },
  { id: "movers", name: "Recently Moved", category: "Behavioral", globalReach: 1_100_000, trend: "flat", overlapGroups: ["lifeevent"] },
  { id: "newjob", name: "Recently Started New Job", category: "Behavioral", globalReach: 1_400_000, trend: "flat", overlapGroups: ["lifeevent"] },
  // Demographic
  { id: "genz", name: "18–24 Gen Z", category: "Demographic", globalReach: 5_400_000, trend: "up", overlapGroups: ["young"] },
  { id: "mill", name: "25–34 Millennials", category: "Demographic", globalReach: 7_200_000, trend: "flat", overlapGroups: [] },
  { id: "dec", name: "35–54 Decision Makers", category: "Demographic", globalReach: 4_800_000, trend: "flat", overlapGroups: ["decision"] },
  { id: "hnw", name: "55+ High-Net-Worth", category: "Demographic", globalReach: 1_100_000, trend: "up", overlapGroups: [] },
  { id: "genalpha", name: "Gen Alpha (Parents of)", category: "Demographic", globalReach: 2_900_000, trend: "up", overlapGroups: ["family"] },
  { id: "boomers", name: "Baby Boomers 60+", category: "Demographic", globalReach: 3_700_000, trend: "flat", overlapGroups: [] },
  { id: "singles", name: "Single Adults 25–40", category: "Demographic", globalReach: 4_200_000, trend: "flat", overlapGroups: [] },
  { id: "married", name: "Married Couples 30–50", category: "Demographic", globalReach: 5_100_000, trend: "flat", overlapGroups: ["family"] },
  { id: "urban", name: "Urban Professionals", category: "Demographic", globalReach: 6_800_000, trend: "up", overlapGroups: [] },
  { id: "suburban", name: "Suburban Families", category: "Demographic", globalReach: 5_400_000, trend: "flat", overlapGroups: ["family"] },
  { id: "rural", name: "Rural Communities", category: "Demographic", globalReach: 3_100_000, trend: "flat", overlapGroups: [] },
  { id: "income100k", name: "Household Income $100K+", category: "Demographic", globalReach: 2_400_000, trend: "flat", overlapGroups: ["hnw"] },
  { id: "income250k", name: "Household Income $250K+", category: "Demographic", globalReach: 480_000, trend: "flat", overlapGroups: ["hnw"] },
  { id: "collegegrad", name: "College Graduates", category: "Demographic", globalReach: 8_900_000, trend: "flat", overlapGroups: [] },
  { id: "postgrad", name: "Graduate Degree Holders", category: "Demographic", globalReach: 2_700_000, trend: "flat", overlapGroups: ["decision"] },
  { id: "lgbtq", name: "LGBTQ+ Community", category: "Demographic", globalReach: 3_400_000, trend: "up", overlapGroups: [] },
  { id: "multilingual", name: "Multilingual Households", category: "Demographic", globalReach: 4_600_000, trend: "flat", overlapGroups: [] },
  { id: "expats", name: "Expats & Diaspora", category: "Demographic", globalReach: 1_900_000, trend: "up", overlapGroups: [] },
  // Lookalike
  { id: "top1", name: "Top 1% Spenders Mirror", category: "Lookalike", globalReach: 980_000, trend: "flat", overlapGroups: [] },
  { id: "top5", name: "Top 5% LTV Model", category: "Lookalike", globalReach: 2_300_000, trend: "flat", overlapGroups: [] },
  { id: "comp", name: "Competitor Audience Clone", category: "Lookalike", globalReach: 3_700_000, trend: "flat", overlapGroups: [] },
  { id: "lkbuyers", name: "Lookalike of Recent Buyers", category: "Lookalike", globalReach: 1_800_000, trend: "up", overlapGroups: [] },
  { id: "lkengaged", name: "Lookalike of Engaged Users", category: "Lookalike", globalReach: 4_200_000, trend: "up", overlapGroups: [] },
  { id: "lkleads", name: "Lookalike of Lead Form Submits", category: "Lookalike", globalReach: 2_600_000, trend: "up", overlapGroups: [] },
  { id: "lkvideo", name: "Lookalike of Video Viewers", category: "Lookalike", globalReach: 5_100_000, trend: "flat", overlapGroups: [] },
  { id: "lkapp", name: "Lookalike of App Installs", category: "Lookalike", globalReach: 1_400_000, trend: "up", overlapGroups: [] },
];

type City = { name: string; pct: number; cx: number; cy: number; platforms: [string, number][]; bestTime: string; trend: Trend };
type Country = { code: string; flag: string; name: string; cities: City[] };

const COUNTRIES: Country[] = [
  { code: "BD", flag: "🇧🇩", name: "Bangladesh", cities: [
    { name: "Dhaka", pct: 89, cx: 55, cy: 45, platforms: [["Facebook", 68], ["TikTok", 44]], bestTime: "Weekdays 7–9pm", trend: "up" },
    { name: "Chittagong", pct: 72, cx: 70, cy: 65, platforms: [["Facebook", 62], ["YouTube", 38]], bestTime: "Weekdays 8–10pm", trend: "up" },
    { name: "Sylhet", pct: 61, cx: 75, cy: 30, platforms: [["Facebook", 58], ["WhatsApp", 41]], bestTime: "Evenings 7–9pm", trend: "flat" },
    { name: "Rajshahi", pct: 54, cx: 30, cy: 35, platforms: [["Facebook", 55], ["TikTok", 32]], bestTime: "Weekends 6–9pm", trend: "up" },
    { name: "Khulna", pct: 30, cx: 35, cy: 65, platforms: [["Facebook", 48], ["YouTube", 22]], bestTime: "Evenings 8–10pm", trend: "down" },
    { name: "Barisal", pct: 43, cx: 50, cy: 72, platforms: [["Facebook", 51], ["TikTok", 24]], bestTime: "Evenings 7–9pm", trend: "flat" },
    { name: "Mymensingh", pct: 67, cx: 52, cy: 28, platforms: [["Facebook", 60], ["TikTok", 36]], bestTime: "Weekdays 7–9pm", trend: "up" },
    { name: "Rangpur", pct: 38, cx: 40, cy: 18, platforms: [["Facebook", 49], ["WhatsApp", 28]], bestTime: "Evenings 8–10pm", trend: "flat" },
    { name: "Comilla", pct: 58, cx: 62, cy: 55, platforms: [["Facebook", 56], ["TikTok", 34]], bestTime: "Weekdays 7–9pm", trend: "up" },
    { name: "Narayanganj", pct: 71, cx: 57, cy: 50, platforms: [["Facebook", 65], ["TikTok", 40]], bestTime: "Weekdays 7–10pm", trend: "up" },
  ]},
  { code: "US", flag: "🇺🇸", name: "United States", cities: [
    { name: "New York", pct: 92, cx: 78, cy: 35, platforms: [["Meta", 71], ["TikTok", 52]], bestTime: "Weekdays 6–9pm", trend: "up" },
    { name: "Los Angeles", pct: 85, cx: 18, cy: 55, platforms: [["Meta", 65], ["TikTok", 58]], bestTime: "Evenings 7–10pm", trend: "up" },
    { name: "Chicago", pct: 78, cx: 55, cy: 40, platforms: [["Meta", 68], ["YouTube", 44]], bestTime: "Weekdays 6–9pm", trend: "flat" },
    { name: "Houston", pct: 71, cx: 48, cy: 70, platforms: [["Meta", 62], ["TikTok", 41]], bestTime: "Evenings 7–10pm", trend: "up" },
    { name: "Miami", pct: 80, cx: 75, cy: 78, platforms: [["TikTok", 60], ["Meta", 56]], bestTime: "Evenings 8–11pm", trend: "up" },
    { name: "Seattle", pct: 73, cx: 18, cy: 22, platforms: [["Meta", 60], ["Google", 48]], bestTime: "Weekdays 6–9pm", trend: "flat" },
    { name: "Denver", pct: 60, cx: 38, cy: 45, platforms: [["Meta", 54], ["TikTok", 38]], bestTime: "Evenings 7–9pm", trend: "flat" },
    { name: "Atlanta", pct: 66, cx: 65, cy: 65, platforms: [["TikTok", 52], ["Meta", 50]], bestTime: "Evenings 7–10pm", trend: "up" },
  ]},
  { code: "GB", flag: "🇬🇧", name: "United Kingdom", cities: [
    { name: "London", pct: 88, cx: 50, cy: 60, platforms: [["Meta", 64], ["TikTok", 49]], bestTime: "Evenings 6–9pm", trend: "up" },
    { name: "Manchester", pct: 72, cx: 42, cy: 35, platforms: [["Meta", 60], ["TikTok", 44]], bestTime: "Evenings 7–9pm", trend: "up" },
    { name: "Birmingham", pct: 68, cx: 45, cy: 50, platforms: [["Meta", 58], ["YouTube", 40]], bestTime: "Weekdays 6–9pm", trend: "flat" },
    { name: "Glasgow", pct: 55, cx: 35, cy: 15, platforms: [["Meta", 52], ["TikTok", 38]], bestTime: "Evenings 7–10pm", trend: "flat" },
    { name: "Liverpool", pct: 62, cx: 38, cy: 38, platforms: [["TikTok", 48], ["Meta", 45]], bestTime: "Evenings 7–9pm", trend: "up" },
  ]},
  { code: "AE", flag: "🇦🇪", name: "UAE", cities: [
    { name: "Dubai", pct: 91, cx: 55, cy: 50, platforms: [["Instagram", 72], ["TikTok", 58]], bestTime: "Evenings 9–11pm", trend: "up" },
    { name: "Abu Dhabi", pct: 78, cx: 50, cy: 60, platforms: [["Instagram", 64], ["Snap", 41]], bestTime: "Evenings 9–11pm", trend: "up" },
    { name: "Sharjah", pct: 64, cx: 58, cy: 48, platforms: [["Instagram", 55], ["TikTok", 42]], bestTime: "Evenings 8–10pm", trend: "flat" },
    { name: "Ajman", pct: 52, cx: 60, cy: 45, platforms: [["Instagram", 48], ["TikTok", 35]], bestTime: "Evenings 8–10pm", trend: "flat" },
  ]},
  { code: "SG", flag: "🇸🇬", name: "Singapore", cities: [
    { name: "Central", pct: 86, cx: 50, cy: 50, platforms: [["TikTok", 64], ["Meta", 58]], bestTime: "Evenings 7–10pm", trend: "up" },
    { name: "East", pct: 72, cx: 65, cy: 52, platforms: [["TikTok", 55], ["Meta", 50]], bestTime: "Evenings 7–10pm", trend: "up" },
    { name: "West", pct: 68, cx: 32, cy: 50, platforms: [["TikTok", 52], ["Meta", 48]], bestTime: "Evenings 8–10pm", trend: "flat" },
    { name: "North", pct: 60, cx: 50, cy: 28, platforms: [["TikTok", 48], ["Meta", 44]], bestTime: "Evenings 8–10pm", trend: "flat" },
  ]},
  { code: "AU", flag: "🇦🇺", name: "Australia", cities: [
    { name: "Sydney", pct: 84, cx: 78, cy: 65, platforms: [["Meta", 66], ["TikTok", 52]], bestTime: "Evenings 7–10pm", trend: "up" },
    { name: "Melbourne", pct: 79, cx: 65, cy: 75, platforms: [["Meta", 62], ["TikTok", 50]], bestTime: "Evenings 7–10pm", trend: "up" },
    { name: "Brisbane", pct: 65, cx: 75, cy: 50, platforms: [["Meta", 58], ["TikTok", 44]], bestTime: "Evenings 7–9pm", trend: "flat" },
    { name: "Perth", pct: 55, cx: 18, cy: 60, platforms: [["Meta", 52], ["YouTube", 40]], bestTime: "Evenings 7–10pm", trend: "flat" },
  ]},
  { code: "BR", flag: "🇧🇷", name: "Brazil", cities: [
    { name: "São Paulo", pct: 90, cx: 55, cy: 65, platforms: [["Meta", 70], ["TikTok", 58]], bestTime: "Evenings 8–11pm", trend: "up" },
    { name: "Rio de Janeiro", pct: 82, cx: 62, cy: 70, platforms: [["Meta", 65], ["TikTok", 56]], bestTime: "Evenings 8–11pm", trend: "up" },
    { name: "Brasília", pct: 64, cx: 50, cy: 55, platforms: [["Meta", 58], ["WhatsApp", 48]], bestTime: "Evenings 8–10pm", trend: "flat" },
    { name: "Salvador", pct: 58, cx: 70, cy: 45, platforms: [["Meta", 54], ["TikTok", 42]], bestTime: "Evenings 8–10pm", trend: "flat" },
    { name: "Fortaleza", pct: 62, cx: 72, cy: 30, platforms: [["Meta", 56], ["TikTok", 44]], bestTime: "Evenings 8–10pm", trend: "up" },
  ]},
  { code: "IN", flag: "🇮🇳", name: "India", cities: [
    { name: "Mumbai", pct: 87, cx: 30, cy: 55, platforms: [["Meta", 64], ["YouTube", 58]], bestTime: "Evenings 8–11pm", trend: "up" },
    { name: "Delhi", pct: 85, cx: 45, cy: 30, platforms: [["Meta", 62], ["YouTube", 56]], bestTime: "Evenings 8–10pm", trend: "up" },
    { name: "Bangalore", pct: 80, cx: 42, cy: 75, platforms: [["YouTube", 60], ["Meta", 55]], bestTime: "Evenings 8–11pm", trend: "up" },
    { name: "Chennai", pct: 70, cx: 50, cy: 80, platforms: [["YouTube", 54], ["Meta", 50]], bestTime: "Evenings 8–10pm", trend: "flat" },
    { name: "Kolkata", pct: 68, cx: 70, cy: 45, platforms: [["Meta", 56], ["YouTube", 48]], bestTime: "Evenings 8–10pm", trend: "flat" },
    { name: "Hyderabad", pct: 72, cx: 45, cy: 60, platforms: [["YouTube", 56], ["Meta", 52]], bestTime: "Evenings 8–10pm", trend: "up" },
  ]},
  { code: "PK", flag: "🇵🇰", name: "Pakistan", cities: [
    { name: "Karachi", pct: 78, cx: 30, cy: 75, platforms: [["Facebook", 64], ["TikTok", 52]], bestTime: "Evenings 8–11pm", trend: "up" },
    { name: "Lahore", pct: 76, cx: 55, cy: 40, platforms: [["Facebook", 62], ["TikTok", 50]], bestTime: "Evenings 8–10pm", trend: "up" },
    { name: "Islamabad", pct: 68, cx: 55, cy: 25, platforms: [["Facebook", 58], ["YouTube", 48]], bestTime: "Evenings 8–10pm", trend: "flat" },
    { name: "Faisalabad", pct: 55, cx: 50, cy: 45, platforms: [["Facebook", 52], ["TikTok", 40]], bestTime: "Evenings 8–10pm", trend: "flat" },
  ]},
  { code: "ID", flag: "🇮🇩", name: "Indonesia", cities: [
    { name: "Jakarta", pct: 84, cx: 30, cy: 70, platforms: [["TikTok", 66], ["Meta", 58]], bestTime: "Evenings 7–10pm", trend: "up" },
    { name: "Surabaya", pct: 72, cx: 50, cy: 72, platforms: [["TikTok", 58], ["Meta", 50]], bestTime: "Evenings 7–10pm", trend: "up" },
    { name: "Bandung", pct: 65, cx: 35, cy: 68, platforms: [["TikTok", 54], ["Meta", 48]], bestTime: "Evenings 8–10pm", trend: "flat" },
    { name: "Medan", pct: 60, cx: 18, cy: 30, platforms: [["TikTok", 50], ["Meta", 46]], bestTime: "Evenings 8–10pm", trend: "flat" },
  ]},
  { code: "NG", flag: "🇳🇬", name: "Nigeria", cities: [
    { name: "Lagos", pct: 82, cx: 30, cy: 70, platforms: [["Meta", 68], ["TikTok", 50]], bestTime: "Evenings 8–11pm", trend: "up" },
    { name: "Abuja", pct: 70, cx: 45, cy: 50, platforms: [["Meta", 60], ["WhatsApp", 52]], bestTime: "Evenings 7–10pm", trend: "up" },
    { name: "Kano", pct: 55, cx: 55, cy: 25, platforms: [["Meta", 52], ["WhatsApp", 44]], bestTime: "Evenings 8–10pm", trend: "flat" },
    { name: "Port Harcourt", pct: 62, cx: 45, cy: 80, platforms: [["Meta", 55], ["TikTok", 42]], bestTime: "Evenings 8–10pm", trend: "flat" },
  ]},
  { code: "DE", flag: "🇩🇪", name: "Germany", cities: [
    { name: "Berlin", pct: 80, cx: 65, cy: 30, platforms: [["Meta", 60], ["TikTok", 48]], bestTime: "Evenings 7–10pm", trend: "up" },
    { name: "Munich", pct: 75, cx: 55, cy: 70, platforms: [["Meta", 58], ["YouTube", 46]], bestTime: "Evenings 7–9pm", trend: "flat" },
    { name: "Hamburg", pct: 70, cx: 45, cy: 20, platforms: [["Meta", 56], ["TikTok", 44]], bestTime: "Evenings 7–10pm", trend: "flat" },
    { name: "Frankfurt", pct: 65, cx: 40, cy: 50, platforms: [["Meta", 54], ["YouTube", 42]], bestTime: "Evenings 7–9pm", trend: "flat" },
  ]},
  { code: "FR", flag: "🇫🇷", name: "France", cities: [
    { name: "Paris", pct: 84, cx: 50, cy: 30, platforms: [["Meta", 62], ["TikTok", 52]], bestTime: "Evenings 7–10pm", trend: "up" },
    { name: "Marseille", pct: 68, cx: 55, cy: 75, platforms: [["Meta", 56], ["TikTok", 46]], bestTime: "Evenings 8–10pm", trend: "flat" },
    { name: "Lyon", pct: 70, cx: 58, cy: 55, platforms: [["Meta", 58], ["TikTok", 44]], bestTime: "Evenings 7–10pm", trend: "up" },
    { name: "Toulouse", pct: 60, cx: 42, cy: 70, platforms: [["Meta", 52], ["TikTok", 40]], bestTime: "Evenings 7–9pm", trend: "flat" },
  ]},
  { code: "JP", flag: "🇯🇵", name: "Japan", cities: [
    { name: "Tokyo", pct: 86, cx: 70, cy: 45, platforms: [["LINE", 68], ["TikTok", 50]], bestTime: "Evenings 8–11pm", trend: "up" },
    { name: "Osaka", pct: 75, cx: 55, cy: 55, platforms: [["LINE", 62], ["TikTok", 46]], bestTime: "Evenings 8–11pm", trend: "flat" },
    { name: "Yokohama", pct: 72, cx: 68, cy: 48, platforms: [["LINE", 60], ["TikTok", 44]], bestTime: "Evenings 8–10pm", trend: "flat" },
    { name: "Nagoya", pct: 65, cx: 60, cy: 50, platforms: [["LINE", 56], ["Meta", 38]], bestTime: "Evenings 8–10pm", trend: "flat" },
  ]},
  { code: "CA", flag: "🇨🇦", name: "Canada", cities: [
    { name: "Toronto", pct: 82, cx: 65, cy: 65, platforms: [["Meta", 64], ["TikTok", 50]], bestTime: "Evenings 7–10pm", trend: "up" },
    { name: "Vancouver", pct: 76, cx: 18, cy: 50, platforms: [["Meta", 60], ["TikTok", 50]], bestTime: "Evenings 7–10pm", trend: "up" },
    { name: "Montreal", pct: 72, cx: 72, cy: 55, platforms: [["Meta", 58], ["TikTok", 46]], bestTime: "Evenings 7–10pm", trend: "flat" },
    { name: "Calgary", pct: 60, cx: 35, cy: 55, platforms: [["Meta", 54], ["YouTube", 42]], bestTime: "Evenings 7–9pm", trend: "flat" },
  ]},
];

const SEGMENTS = [
  { name: "High-Value Customers", desc: "Repeat buyers >$500 LTV. Buying Apr–Jun.", size: "12,840", confidence: 92, status: "HOT", reach: 78, saturation: 22 },
  { name: "Churn Risk", desc: "No engagement 30d. Lapse predicted in 21d.", size: "3,120", confidence: 87, status: "HOT", reach: 64, saturation: 40 },
  { name: "Lookalike (TikTok)", desc: "Mirror of top 5% spenders.", size: "2.1M", confidence: 81, status: "GROWING", reach: 88, saturation: 18 },
  { name: "Intent: Compare Pricing", desc: "Visited /pricing 2+ times in 7d.", size: "8,640", confidence: 78, status: "STABLE", reach: 56, saturation: 36 },
  { name: "Re-engagement Window", desc: "Lapsed 60–90d, high re-activation probability.", size: "5,200", confidence: 74, status: "GROWING", reach: 60, saturation: 28 },
] as const;

type Cohort = { name: string; size: string; intent: number; conv: number; channel: string; channelIcon: string; revenue: number };
const COHORTS: Cohort[] = [
  { name: "Pricing Page Re-visitors", size: "8,640", intent: 92, conv: 71, channel: "WhatsApp", channelIcon: "💬", revenue: 48200 },
  { name: "High-LTV / Lapsed 30d", size: "3,120", intent: 78, conv: 54, channel: "Email", channelIcon: "📧", revenue: 31700 },
  { name: "Cart Abandoners (24h)", size: "2,940", intent: 95, conv: 82, channel: "Meta Retargeting", channelIcon: "📱", revenue: 52400 },
  { name: "Demo Watchers (>50%)", size: "1,850", intent: 88, conv: 65, channel: "Sales Follow-up", channelIcon: "📞", revenue: 29100 },
  { name: "TikTok Engaged 18–24", size: "41,200", intent: 74, conv: 22, channel: "TikTok Spark", channelIcon: "🎵", revenue: 18600 },
  { name: "Repeat Buyers (VIP)", size: "6,200", intent: 97, conv: 91, channel: "WhatsApp", channelIcon: "💬", revenue: 94000 },
  { name: "Trial Expired (7d)", size: "4,100", intent: 83, conv: 58, channel: "Email + SMS", channelIcon: "📧", revenue: 36800 },
];

const PLATFORMS_BD = [
  { name: "Meta", icon: "📘", reach: 62, cpm: "$0.48", format: "Carousel Ads", peak: "8–10pm", extra: "" },
  { name: "TikTok", icon: "🎵", reach: 48, cpm: "$0.31", format: "Short Video", peak: "9–11pm", extra: "" },
  { name: "Google", icon: "🔍", reach: 31, cpm: "$0.72", format: "Search + Display", peak: "12–2pm", extra: "" },
  { name: "WhatsApp", icon: "💬", reach: 28, cpm: "Open 94%", format: "Broadcast", peak: "7–9pm", extra: "CTR 18%" },
];

// ============================================================
// HOOKS / HELPERS
// ============================================================
function useCountUp(target: number, duration = 500) {
  const [val, setVal] = useState(target);
  const prev = useRef(target);
  useEffect(() => {
    const start = prev.current;
    const startT = performance.now();
    let raf = 0;
    const tick = (t: number) => {
      const p = Math.min(1, (t - startT) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setVal(Math.round(start + (target - start) * eased));
      if (p < 1) raf = requestAnimationFrame(tick);
      else prev.current = target;
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);
  return val;
}

const fmt = (n: number) =>
  n >= 1_000_000 ? `${(n / 1_000_000).toFixed(1)}M` : n >= 1_000 ? `${(n / 1_000).toFixed(0)}K` : `${n}`;

const TrendIcon = ({ t, className }: { t: Trend; className?: string }) =>
  t === "up" ? <TrendingUp className={cn("h-3 w-3 text-emerald-400", className)} />
  : t === "down" ? <TrendingDown className={cn("h-3 w-3 text-rose-400", className)} />
  : <Minus className={cn("h-3 w-3 text-white/50", className)} />;

const categoryTone: Record<Audience["category"], string> = {
  Interest: "bg-violet-500/15 text-violet-300 border-violet-400/30",
  Behavioral: "bg-emerald-500/15 text-emerald-300 border-emerald-400/30",
  Demographic: "bg-sky-500/15 text-sky-300 border-sky-400/30",
  Lookalike: "bg-amber-500/15 text-amber-300 border-amber-400/30",
};

// ============================================================
// MAIN
// ============================================================
function Audience() {
  const [selectedAudiences, setSelectedAudiences] = useState<string[]>(["fitness"]);
  const [selectedCountry, setSelectedCountry] = useState("BD");
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(["ALL"]);
  const [datePeriod, setDatePeriod] = useState<"monthly" | "quarterly" | "yearly" | "custom">("monthly");
  const [customRange, setCustomRange] = useState<DateRange | undefined>();
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [activatedCohorts, setActivatedCohorts] = useState<Record<string, "idle" | "loading" | "done">>({});
  const [search, setSearch] = useState("");
  const [searchFocus, setSearchFocus] = useState(false);
  const [highlightIdx, setHighlightIdx] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [countryOpen, setCountryOpen] = useState(false);

  const country = COUNTRIES.find((c) => c.code === selectedCountry)!;

  // Period multiplier — drives reactive KPI updates when date selection changes
  const periodFactor = useMemo(() => {
    if (datePeriod === "monthly") return 1;
    if (datePeriod === "quarterly") return 2.85;
    if (datePeriod === "yearly") return 10.4;
    if (datePeriod === "custom" && customRange?.from && customRange?.to) {
      const days = Math.max(1, Math.round((customRange.to.getTime() - customRange.from.getTime()) / 86_400_000));
      return Math.min(12, Math.max(0.2, days / 30));
    }
    return 1;
  }, [datePeriod, customRange]);
  const primary = AUDIENCES.find((a) => a.id === selectedAudiences[0]);

  // Trigger skeleton on country / period change
  useEffect(() => {
    setIsLoading(true);
    const id = setTimeout(() => setIsLoading(false), 800);
    return () => clearTimeout(id);
  }, [selectedCountry, datePeriod, customRange]);

  // Derived KPIs (Bangladesh + Fitness as canonical baseline)
  const totalReachBase = selectedAudiences.reduce(
    (s, id) => s + (AUDIENCES.find((a) => a.id === id)?.globalReach ?? 0), 0
  );
  const totalReach = Math.round(totalReachBase * Math.min(1.6, 0.6 + periodFactor * 0.12));
  const countryFactor =
    country.code === "BD" ? 0.068 : country.code === "US" ? 0.21 : country.code === "IN" ? 0.18 : 0.11;
  const inCountry = Math.round(totalReach * countryFactor);
  const predictedBuyers = Math.round(inCountry * 0.044 * periodFactor);
  const confidence = primary ? Math.max(60, Math.min(95, 70 + (primary.trend === "up" ? 17 : 6))) : 80;

  const totalReachAnim = useCountUp(totalReach);
  const inCountryAnim = useCountUp(inCountry);
  const predictedAnim = useCountUp(predictedBuyers);
  const confidenceAnim = useCountUp(confidence);

  // Overlap detection
  const overlapWarning = useMemo(() => {
    const groups = selectedAudiences
      .map((id) => AUDIENCES.find((a) => a.id === id)?.overlapGroups ?? [])
      .flat();
    const counts: Record<string, number> = {};
    for (const g of groups) counts[g] = (counts[g] ?? 0) + 1;
    return Object.values(counts).some((n) => n >= 2);
  }, [selectedAudiences]);

  // Filtered audiences — fuzzy / partial / multi-token match (Meta-style)
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return AUDIENCES;
    const tokens = q.split(/\s+/).filter(Boolean);
    return AUDIENCES.filter((a) => {
      const hay = `${a.name} ${a.category}`.toLowerCase();
      return tokens.every((t) => hay.includes(t));
    });
  }, [search]);

  const grouped = useMemo(() => {
    const g: Record<string, Audience[]> = { Interest: [], Behavioral: [], Demographic: [], Lookalike: [] };
    filtered.forEach((a) => g[a.category].push(a));
    return g;
  }, [filtered]);

  const addAudience = (id: string) => {
    if (!selectedAudiences.includes(id)) setSelectedAudiences([...selectedAudiences, id]);
    setSearch("");
  };
  const removeAudience = (id: string) =>
    setSelectedAudiences(selectedAudiences.filter((x) => x !== id));

  const togglePlatform = (p: string) => {
    if (p === "ALL") return setSelectedPlatforms(["ALL"]);
    const next = selectedPlatforms.filter((x) => x !== "ALL");
    setSelectedPlatforms(
      next.includes(p) ? (next.filter((x) => x !== p).length ? next.filter((x) => x !== p) : ["ALL"])
        : [...next, p]
    );
  };

  const activateCohort = (name: string) => {
    setActivatedCohorts((s) => ({ ...s, [name]: "loading" }));
    setTimeout(() => {
      setActivatedCohorts((s) => ({ ...s, [name]: "done" }));
      toast.success(`${name} activated`);
    }, 800);
  };

  const askAI = (msg: string) => toast.message("AI Advisor", { description: msg });

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") { setHighlightIdx((i) => Math.min(filtered.length - 1, i + 1)); e.preventDefault(); }
    if (e.key === "ArrowUp")   { setHighlightIdx((i) => Math.max(0, i - 1)); e.preventDefault(); }
    if (e.key === "Enter" && filtered[highlightIdx]) { addAudience(filtered[highlightIdx].id); }
    if (e.key === "Escape") setSearchFocus(false);
  };

  return (
    <div className="text-foreground">
      {/* ============ HEADER ============ */}
      <div className="flex items-end justify-between gap-4 mb-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">Audience Intelligence</h1>
          <p className="text-sm text-white/60 mt-1 max-w-2xl">
            Real-time behavioral segmentation, geo-intent mapping, and predictive audience modeling — globally powered.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            className="border-white/15 bg-transparent hover:bg-white/5"
            onClick={() => toast.success("Report exported (PDF + CSV)")}
          >
            <Download className="h-4 w-4 mr-2" />Export Report
          </Button>
        </div>
      </div>

      {/* Live stream bar */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-1.5">
          <div className="flex items-center gap-2 text-[11px] uppercase tracking-widest text-emerald-300/90">
            <span className="relative flex h-2 w-2">
              <span className="absolute inset-0 rounded-full bg-emerald-400 animate-ping opacity-75" />
              <span className="relative h-2 w-2 rounded-full bg-emerald-400" />
            </span>
            Live Data Stream — Updated 4s ago
          </div>
          <div className="text-[11px] text-white/40">Refresh interval · 4s</div>
        </div>
        <div className="h-[3px] rounded-full bg-white/5 overflow-hidden relative">
          <div className="absolute inset-y-0 -left-1/3 w-1/3 bg-gradient-to-r from-transparent via-emerald-400 to-transparent animate-[stream_2s_linear_infinite]" />
        </div>
      </div>

      {/* ============ SECTION 2 — META TARGET ENGINE ============ */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4 text-[#7F77DD]" />
            <div className="text-sm font-semibold">Target Audience Engine</div>
          </div>
          <Badge tone="green">PREDICTIVE LAYER</Badge>
        </div>

        {/* Search */}
        <div className="relative" onBlur={() => setTimeout(() => setSearchFocus(false), 120)}>
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40 animate-pulse" />
            <Input
              value={search}
              onChange={(e) => { setSearch(e.target.value); setHighlightIdx(0); }}
              onFocus={() => setSearchFocus(true)}
              onKeyDown={onKeyDown}
              placeholder="Target Audience — search any interest, behavior, or demographic (e.g. yoga, crypto, SaaS founders, luxury travel)"
              className="h-12 pl-11 bg-[#0f1117] border-white/10 text-sm rounded-lg focus-visible:ring-[#7F77DD]"
            />
          </div>

          <AnimatePresence>
            {searchFocus && (
              <motion.div
                initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}
                className="absolute z-30 left-0 right-0 mt-2 max-h-[360px] overflow-auto rounded-xl border border-white/10 bg-[#13162a] shadow-2xl"
              >
                {(Object.keys(grouped) as Audience["category"][]).map((cat) =>
                  grouped[cat].length ? (
                    <div key={cat} className="py-1">
                      <div className="px-4 py-1.5 text-[10px] uppercase tracking-widest text-white/40">{cat}-based</div>
                      {grouped[cat].map((a) => {
                        const isSelected = selectedAudiences.includes(a.id);
                        return (
                          <button
                            key={a.id}
                            onMouseDown={(e) => { e.preventDefault(); addAudience(a.id); }}
                            className={cn(
                              "w-full flex items-center justify-between gap-3 px-4 py-2 text-sm hover:bg-white/5 text-left",
                              isSelected && "opacity-50"
                            )}
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <span className={cn("text-[10px] uppercase border rounded-full px-2 py-0.5", categoryTone[a.category])}>
                                {a.category}
                              </span>
                              <span className="truncate">{a.name}</span>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-white/60">
                              {fmt(a.globalReach)}
                              <TrendIcon t={a.trend} />
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  ) : null
                )}
                {!filtered.length && (
                  <div className="px-4 py-6 text-sm text-white/50 text-center">No audiences match "{search}"</div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Pills */}
        <div className="flex flex-wrap gap-2 mt-3 min-h-[28px]">
          {selectedAudiences.map((id) => {
            const a = AUDIENCES.find((x) => x.id === id)!;
            return (
              <span key={id} className="inline-flex items-center gap-2 rounded-full bg-[#7F77DD]/20 border border-[#7F77DD]/40 text-[#C8C3FF] text-xs px-3 py-1">
                {a.name}
                <button onClick={() => removeAudience(id)} className="hover:text-white"><X className="h-3 w-3" /></button>
              </span>
            );
          })}
          {overlapWarning && (
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/15 border border-amber-400/40 text-amber-300 text-xs px-3 py-1">
              <AlertTriangle className="h-3 w-3" /> Audience Overlap &gt; 40%
            </span>
          )}
        </div>

        {/* Country + Platforms + Time */}
        <div className="mt-4 grid grid-cols-1 lg:grid-cols-[260px_1fr_auto] gap-3 items-center">
          {/* Country */}
          <div className="relative">
            <button
              onClick={() => setCountryOpen((o) => !o)}
              className="w-full flex items-center justify-between gap-2 h-10 px-3 rounded-lg border border-white/10 bg-[#0f1117] text-sm hover:bg-white/[0.03]"
            >
              <span className="flex items-center gap-2"><span className="text-base">{country.flag}</span>{country.name}</span>
              <ChevronDown className="h-4 w-4 text-white/50" />
            </button>
            {countryOpen && (
              <div className="absolute z-30 left-0 right-0 mt-1 max-h-72 overflow-auto rounded-lg border border-white/10 bg-[#13162a] shadow-2xl">
                {COUNTRIES.map((c) => (
                  <button
                    key={c.code}
                    onClick={() => { setSelectedCountry(c.code); setCountryOpen(false); }}
                    className={cn("w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-white/5 text-left",
                      c.code === selectedCountry && "bg-white/[0.04]")}
                  >
                    <span className="text-base">{c.flag}</span>{c.name}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Platforms */}
          <div className="flex flex-wrap gap-1.5">
            {["ALL", "Meta", "TikTok", "Google", "WhatsApp", "Email"].map((p) => {
              const active = selectedPlatforms.includes(p);
              return (
                <button
                  key={p}
                  onClick={() => togglePlatform(p)}
                  className={cn(
                    "text-xs px-3 py-1.5 rounded-full border transition-colors",
                    active
                      ? "bg-[#7F77DD]/20 border-[#7F77DD]/50 text-[#C8C3FF]"
                      : "bg-transparent border-white/10 text-white/60 hover:bg-white/[0.04]"
                  )}
                >{p}</button>
              );
            })}
          </div>

          {/* Date period */}
          <div className="flex items-center gap-2">
            <div className="flex rounded-lg border border-white/10 overflow-hidden">
              {([
                ["monthly", "Monthly"],
                ["quarterly", "Quarterly"],
                ["yearly", "Yearly"],
              ] as const).map(([key, label]) => (
                <button
                  key={key}
                  onClick={() => { setDatePeriod(key); setCustomRange(undefined); }}
                  className={cn("text-xs px-3 py-2 transition-colors",
                    datePeriod === key ? "bg-[#7F77DD]/20 text-[#C8C3FF]" : "text-white/60 hover:bg-white/[0.04]")}
                >{label}</button>
              ))}
            </div>
            <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
              <PopoverTrigger asChild>
                <button
                  onClick={() => setDatePeriod("custom")}
                  className={cn(
                    "inline-flex items-center gap-2 text-xs px-3 py-2 rounded-lg border transition-colors",
                    datePeriod === "custom"
                      ? "bg-[#7F77DD]/20 border-[#7F77DD]/50 text-[#C8C3FF]"
                      : "border-white/10 text-white/60 hover:bg-white/[0.04]"
                  )}
                >
                  <CalendarIcon className="h-3.5 w-3.5" />
                  {customRange?.from
                    ? customRange.to
                      ? `${format(customRange.from, "MMM d")} – ${format(customRange.to, "MMM d, yyyy")}`
                      : format(customRange.from, "MMM d, yyyy")
                    : "Custom"}
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 bg-[#13162a] border-white/10" align="end">
                <Calendar
                  mode="range"
                  selected={customRange}
                  onSelect={(r) => {
                    setCustomRange(r);
                    setDatePeriod("custom");
                    if (r?.from && r?.to) setCalendarOpen(false);
                  }}
                  numberOfMonths={2}
                  initialFocus
                  className={cn("p-3 pointer-events-auto")}
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>

        {/* KPIs */}
        <div className="mt-5 grid grid-cols-2 lg:grid-cols-5 gap-3">
          <Kpi label="Total Reach" value={fmt(totalReachAnim)} loading={isLoading} sparkline />
          <Kpi label="In-Country Audience" value={fmt(inCountryAnim)} loading={isLoading} />
          <Kpi label="Predicted Buyers (30d)" value={predictedAnim.toLocaleString()} loading={isLoading} accent="emerald" />
          <Kpi label="Avg AI Confidence" value={`${confidenceAnim}%`} loading={isLoading} ring={confidence} />
          <Kpi label="Audience Health" value="" loading={isLoading} health={confidence} />
        </div>
      </Card>

      {/* ============ SECTION 3 — DUAL PANEL ============ */}
      <div className="grid grid-cols-1 lg:grid-cols-[3fr_2fr] gap-5 mt-5">
        <GeoMap country={country} loading={isLoading} onDrill={() => askAI(`Show city-level breakdown for ${country.name}`)} />
        <SegmentsPanel onActivate={() => askAI("Activate campaign for High-Value Customers")} />
      </div>

      {/* ============ SECTION 4 — COHORT EXPLORER ============ */}
      <CohortTable
        rows={COHORTS}
        states={activatedCohorts}
        onActivate={activateCohort}
      />

      {/* ============ SECTION 5 — PREDICTIVE ANALYTICS ============ */}
      <PredictiveAnalytics />

      {/* ============ SECTION 6 — PLATFORM REACH ============ */}
      <PlatformReach country={country} />

      {/* ============ SECTION 7 — AI INSIGHT STRIP ============ */}
      <AIInsightStrip onAsk={askAI} country={country.name} />

      {/* ============ SECTION 8 — FOOTER ============ */}
      <div className="mt-6 mb-2 flex items-center gap-2 rounded-xl border border-white/5 bg-[#0d0f1a] px-4 py-3 text-xs text-white/55">
        <Lock className="h-3.5 w-3.5 text-white/40" />
        Privacy-safe: All profiles inferred from first-party data + Meta Audience Insights API + behavioral signals.
        GDPR · CCPA · PDPA · Bangladesh Digital Security Act compliant. Data refreshes every 4 seconds.
      </div>

      <style>{`
        @keyframes stream { 0% { transform: translateX(0); } 100% { transform: translateX(400%); } }
        @keyframes ringDraw { from { stroke-dashoffset: 113; } }
        @keyframes nodeFade { from { opacity: 0; transform: scale(0.4); } to { opacity: 1; transform: scale(1); } }
      `}</style>
    </div>
  );
}

// ============================================================
// SUB-COMPONENTS
// ============================================================
function Card({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn(
      "rounded-xl border border-white/[0.08] bg-[#1a1d2e] p-5 shadow-[0_1px_3px_rgba(0,0,0,0.4)]",
      className
    )}>{children}</div>
  );
}

function Badge({ children, tone = "green" }: { children: React.ReactNode; tone?: "green" | "purple" | "amber" | "red" | "neutral" }) {
  const map = {
    green: "bg-[#1D9E75]/15 text-[#5CE0AE] border-[#1D9E75]/40",
    purple: "bg-[#7F77DD]/15 text-[#C8C3FF] border-[#7F77DD]/40",
    amber: "bg-amber-500/15 text-amber-300 border-amber-400/40",
    red: "bg-rose-500/15 text-rose-300 border-rose-400/40",
    neutral: "bg-white/5 text-white/70 border-white/10",
  };
  return <span className={cn("inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider", map[tone])}>{children}</span>;
}

function Kpi({ label, value, loading, sparkline, accent, ring, health }: {
  label: string; value: string; loading?: boolean; sparkline?: boolean;
  accent?: "emerald"; ring?: number; health?: number;
}) {
  if (loading) return <div className="rounded-lg border border-white/[0.06] bg-[#0f1117] p-4 h-[88px] animate-pulse" />;
  const healthLabel = health == null ? null
    : health >= 85 ? { txt: "Excellent", cls: "bg-emerald-500/15 text-emerald-300 border-emerald-400/40" }
    : health >= 70 ? { txt: "Good", cls: "bg-teal-500/15 text-teal-300 border-teal-400/40" }
    : health >= 55 ? { txt: "Saturated", cls: "bg-amber-500/15 text-amber-300 border-amber-400/40" }
    : { txt: "Declining", cls: "bg-rose-500/15 text-rose-300 border-rose-400/40" };

  return (
    <div className="rounded-lg border border-white/[0.06] bg-[#0f1117] p-4 flex flex-col gap-1.5 transition hover:bg-white/[0.02]">
      <div className="text-[11px] uppercase tracking-wider text-white/45">{label}</div>
      <div className="flex items-center justify-between gap-3">
        {ring != null ? (
          <div className="flex items-center gap-2">
            <ConfidenceRing pct={ring} size={36} />
            <div className={cn("text-xl font-semibold", accent === "emerald" && "text-emerald-300")}>{value}</div>
          </div>
        ) : healthLabel ? (
          <span className={cn("inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-medium", healthLabel.cls)}>
            {healthLabel.txt}
          </span>
        ) : (
          <div className={cn("text-xl font-semibold tabular-nums", accent === "emerald" && "text-emerald-300")}>{value}</div>
        )}
        {sparkline && (
          <svg width="56" height="22" viewBox="0 0 56 22" className="text-[#1D9E75]">
            <polyline fill="none" stroke="currentColor" strokeWidth="1.5"
              points="0,16 8,14 16,15 24,10 32,11 40,6 48,7 56,3" />
          </svg>
        )}
      </div>
    </div>
  );
}

function ConfidenceRing({ pct, size = 44, stroke = 3, color = "#1D9E75" }: { pct: number; size?: number; stroke?: number; color?: string }) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const dash = (pct / 100) * c;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="shrink-0">
      <circle cx={size/2} cy={size/2} r={r} stroke="rgba(255,255,255,0.08)" strokeWidth={stroke} fill="none" />
      <circle cx={size/2} cy={size/2} r={r} stroke={color} strokeWidth={stroke} fill="none"
        strokeDasharray={`${dash} ${c}`} strokeLinecap="round"
        transform={`rotate(-90 ${size/2} ${size/2})`}
        style={{ animation: "ringDraw 600ms ease-out" }} />
      <text x="50%" y="54%" textAnchor="middle" fill="white" fontSize={size * 0.28} fontWeight={600}>{pct}</text>
    </svg>
  );
}

// ============ GEO MAP ============
function GeoMap({ country, loading, onDrill }: { country: Country; loading: boolean; onDrill: () => void }) {
  const [hover, setHover] = useState<City | null>(null);
  const [pos, setPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  const colorFor = (pct: number) => {
    const t = Math.max(0, Math.min(1, (pct - 30) / 60));
    const blend = (a: number[], b: number[]) => a.map((v, i) => Math.round(v + (b[i] - v) * t));
    const [r, g, b] = blend([181, 212, 244], [4, 44, 83]);
    return `rgb(${r},${g},${b})`;
  };

  return (
    <Card className="relative">
      <div className="flex items-center justify-between mb-3">
        <div>
          <div className="text-sm font-semibold flex items-center gap-2"><MapPin className="h-4 w-4 text-[#7F77DD]" /> Geo-Intent Distribution Map</div>
          <div className="text-xs text-white/45 mt-0.5">{country.name} · {country.cities.length} city nodes</div>
        </div>
        <Badge tone="green">LIVE</Badge>
      </div>

      <div ref={containerRef} className="relative h-[420px] rounded-lg bg-[radial-gradient(ellipse_at_center,rgba(127,119,221,0.10),transparent_70%)] overflow-hidden border border-white/5">
        {/* dot grid */}
        <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full opacity-25" preserveAspectRatio="none">
          {Array.from({ length: 22 }).map((_, r) =>
            Array.from({ length: 22 }).map((_, c) => (
              <circle key={`${r}-${c}`} cx={c * 5 + 2.5} cy={r * 5 + 2.5} r="0.3" fill="white" />
            ))
          )}
        </svg>

        {loading ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <Loader2 className="h-6 w-6 text-white/30 animate-spin" />
          </div>
        ) : (
          country.cities.map((city, i) => {
            const r = 8 + (city.pct / 100) * 18;
            return (
              <button
                key={city.name}
                className="absolute -translate-x-1/2 -translate-y-1/2 group"
                style={{
                  left: `${city.cx}%`, top: `${city.cy}%`,
                  animation: `nodeFade 400ms ease-out ${i * 50}ms both`,
                }}
                onMouseEnter={(e) => {
                  const rect = containerRef.current!.getBoundingClientRect();
                  setPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
                  setHover(city);
                }}
                onMouseMove={(e) => {
                  const rect = containerRef.current!.getBoundingClientRect();
                  setPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
                }}
                onMouseLeave={() => setHover(null)}
              >
                <span className="absolute inset-0 rounded-full opacity-60" style={{ width: r * 2, height: r * 2, left: -r, top: -r, background: colorFor(city.pct), filter: "blur(8px)" }} />
                <span className="block rounded-full border-2 border-white/30 group-hover:border-white/80 transition-colors"
                  style={{ width: r * 2, height: r * 2, marginLeft: -r, marginTop: -r, background: colorFor(city.pct) }} />
                <span className="absolute left-1/2 top-full mt-1 -translate-x-1/2 whitespace-nowrap text-[10px] text-white/80">
                  {city.name} <span className="text-emerald-300">{city.pct}%</span>
                </span>
              </button>
            );
          })
        )}

        {/* Tooltip */}
        {hover && (
          <div
            className="absolute z-20 pointer-events-none w-[220px] rounded-lg border border-white/10 bg-[#13162a]/95 backdrop-blur p-3 shadow-2xl"
            style={{
              left: Math.min(pos.x + 12, (containerRef.current?.clientWidth ?? 0) - 230),
              top: Math.min(pos.y + 12, (containerRef.current?.clientHeight ?? 0) - 160),
            }}
          >
            <div className="flex items-center justify-between mb-1">
              <div className="text-sm font-semibold">{country.flag} {hover.name}</div>
              <span className="text-xs text-emerald-300">{hover.pct}%</span>
            </div>
            <div className="text-xs text-white/60">≈ {Math.round(hover.pct * 2840).toLocaleString()} people</div>
            <div className="mt-2 space-y-1 text-[11px] text-white/70">
              {hover.platforms.map(([p, v]) => (
                <div key={p} className="flex justify-between"><span>{p}</span><span className="text-white/90">{v}%</span></div>
              ))}
            </div>
            <div className="mt-2 flex items-center justify-between text-[11px]">
              <span className="flex items-center gap-1 text-white/60">
                <TrendIcon t={hover.trend} /> {hover.trend === "up" ? "Growing" : hover.trend === "down" ? "Declining" : "Stable"}
              </span>
              <svg width="40" height="14" viewBox="0 0 40 14" className="text-emerald-400">
                <polyline points="0,10 8,8 16,9 24,5 32,6 40,2" fill="none" stroke="currentColor" strokeWidth="1.5" />
              </svg>
            </div>
            <div className="mt-2 text-[10px] text-white/50 flex items-center gap-1"><Clock className="h-3 w-3" /> {hover.bestTime}</div>
          </div>
        )}
      </div>

      <div className="mt-3 flex items-center justify-between">
        <div className="flex items-center gap-2 text-[10px] text-white/50">
          <span>30%</span>
          <span className="h-1.5 w-32 rounded-full" style={{ background: "linear-gradient(to right, rgb(181,212,244), rgb(4,44,83))" }} />
          <span>90%+</span>
        </div>
        <button onClick={onDrill} className="text-xs text-[#C8C3FF] hover:text-white transition-colors">Drill Down ↗</button>
      </div>
    </Card>
  );
}

// ============ SEGMENTS PANEL ============
function SegmentsPanel({ onActivate }: { onActivate: () => void }) {
  const statusTone: Record<string, "red" | "green" | "purple" | "amber" | "neutral"> = {
    HOT: "red", GROWING: "green", STABLE: "purple", COOLING: "amber",
  };
  return (
    <Card>
      <div className="flex items-center justify-between mb-3">
        <div className="text-sm font-semibold flex items-center gap-2"><Brain className="h-4 w-4 text-[#7F77DD]" /> AI Predictive Segments</div>
      </div>
      <div className="space-y-2.5">
        {SEGMENTS.map((s) => (
          <div key={s.name} className="rounded-lg border border-white/[0.06] bg-[#0f1117] p-3 flex items-center gap-3 hover:bg-white/[0.02] transition">
            <ConfidenceRing pct={s.confidence} size={42} color={s.status === "HOT" ? "#E24B4A" : s.status === "GROWING" ? "#1D9E75" : "#7F77DD"} />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <div className="text-sm font-medium truncate">{s.name}</div>
                <Badge tone={statusTone[s.status]}>{s.status}</Badge>
              </div>
              <div className="text-[11px] text-white/55 truncate">{s.desc}</div>
              <div className="mt-1.5 flex items-center gap-1.5">
                <div className="flex-1 h-1 rounded-full bg-white/5 overflow-hidden">
                  <div className="h-full bg-emerald-400" style={{ width: `${s.reach}%` }} />
                </div>
                <div className="flex-1 h-1 rounded-full bg-white/5 overflow-hidden">
                  <div className="h-full bg-amber-400" style={{ width: `${s.saturation}%` }} />
                </div>
              </div>
            </div>
            <div className="text-sm font-semibold tabular-nums shrink-0">{s.size}</div>
          </div>
        ))}
      </div>
      <div className="mt-4 rounded-lg border-l-4 border-[#7F77DD] bg-[#7F77DD]/10 p-3">
        <div className="text-xs font-semibold text-[#C8C3FF] flex items-center gap-1.5"><Sparkles className="h-3.5 w-3.5" /> AI Recommendation</div>
        <div className="text-xs text-white/75 mt-1">
          Based on your brand DNA and current audience signals, target <b>High-Value Customers</b> via WhatsApp + Meta combo for <b>3.1× predicted ROAS</b>.
        </div>
        <button onClick={onActivate} className="mt-2 text-xs text-[#C8C3FF] hover:text-white">Activate Campaign ↗</button>
      </div>
    </Card>
  );
}

// ============ COHORT TABLE ============
function CohortTable({ rows, states, onActivate }: {
  rows: Cohort[]; states: Record<string, "idle" | "loading" | "done">; onActivate: (n: string) => void;
}) {
  const total = rows.reduce((s, r) => s + r.revenue, 0);
  const convTone = (c: number) =>
    c > 70 ? "bg-emerald-500/15 text-emerald-300 border-emerald-400/40"
    : c >= 40 ? "bg-amber-500/15 text-amber-300 border-amber-400/40"
    : "bg-rose-500/15 text-rose-300 border-rose-400/40";

  return (
    <Card className="mt-5 p-0 overflow-hidden">
      <div className="p-4 flex items-center justify-between border-b border-white/5">
        <div className="text-sm font-semibold flex items-center gap-2"><Users className="h-4 w-4 text-[#7F77DD]" /> Behavioral Cohort Explorer</div>
        <div className="flex gap-1.5">
          {["Last 30d", "Web + App", "All Channels"].map((f) => (
            <span key={f} className="text-[10px] uppercase tracking-wider rounded-full border border-white/10 bg-white/[0.03] px-2.5 py-1 text-white/60">{f}</span>
          ))}
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-[11px] uppercase tracking-wider text-white/45 bg-white/[0.02]">
            <tr>{["Cohort", "Size", "Intent", "Conv. Probability", "Channel", "Predicted Revenue", "Action"].map((h) => (
              <th key={h} className="text-left px-4 py-2.5 font-medium">{h}</th>
            ))}</tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {rows.map((r) => {
              const state = states[r.name] ?? "idle";
              return (
                <tr key={r.name} className="hover:bg-white/[0.02] transition-colors">
                  <td className="px-4 py-3">{r.name}</td>
                  <td className="px-4 py-3 tabular-nums">{r.size}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 w-24 rounded-full bg-white/5 overflow-hidden">
                        <div className="h-full bg-[#1D9E75] transition-all duration-700" style={{ width: `${r.intent}%` }} />
                      </div>
                      <span className="text-xs text-white/70 tabular-nums">{r.intent}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={cn("inline-block rounded-full border px-2.5 py-0.5 text-xs font-medium", convTone(r.conv))}>{r.conv}%</span>
                  </td>
                  <td className="px-4 py-3 text-white/80"><span className="mr-1.5">{r.channelIcon}</span>{r.channel}</td>
                  <td className="px-4 py-3 text-[#5CE0AE] tabular-nums font-medium">${r.revenue.toLocaleString()}</td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => state === "idle" && onActivate(r.name)}
                      disabled={state !== "idle"}
                      className={cn(
                        "inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-md border transition-all",
                        state === "idle" && "border-[#7F77DD]/40 text-[#C8C3FF] hover:bg-[#7F77DD]/15",
                        state === "loading" && "border-white/10 text-white/60",
                        state === "done" && "border-emerald-400/40 text-emerald-300 bg-emerald-500/10"
                      )}
                    >
                      {state === "loading" && <Loader2 className="h-3 w-3 animate-spin" />}
                      {state === "done" && <Check className="h-3 w-3" />}
                      {state === "idle" ? "Activate" : state === "loading" ? "Activating…" : "Active"}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className="p-3 border-t border-white/5 bg-[#1D9E75]/10">
        <div className="text-sm text-emerald-300 font-medium text-center">
          Total Predicted Pipeline from Cohorts: <span className="font-semibold">${total.toLocaleString()}</span>
        </div>
      </div>
    </Card>
  );
}

// ============ PREDICTIVE ANALYTICS ============
function PredictiveAnalytics() {
  return (
    <Card className="mt-5">
      <div className="mb-4">
        <div className="text-sm font-semibold flex items-center gap-2"><Zap className="h-4 w-4 text-[#7F77DD]" /> Predictive Analytics Engine</div>
        <div className="text-xs text-white/45 mt-0.5">30-day forward modeling based on behavioral signals and historical conversion patterns</div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <GrowthForecast />
        <ConversionMatrix />
        <ChurnTimeline />
      </div>
    </Card>
  );
}

function GrowthForecast() {
  return (
    <div className="rounded-lg border border-white/[0.06] bg-[#0f1117] p-4">
      <div className="text-sm font-medium mb-3">Audience Growth Forecast</div>
      <svg viewBox="0 0 220 120" className="w-full h-32">
        {[20, 50, 80, 110].map((y) => <line key={y} x1="10" x2="210" y1={y} y2={y} stroke="rgba(255,255,255,0.05)" />)}
        {/* Current */}
        <polyline fill="none" stroke="#7F77DD" strokeWidth="1.5" strokeDasharray="3 3"
          points="10,90 50,82 90,76 130,70 170,66 210,62" />
        {/* With activation */}
        <polyline fill="none" stroke="#1D9E75" strokeWidth="2"
          points="10,90 50,80 90,68 130,55 170,42 210,30" />
        {/* Fork marker */}
        <circle cx="90" cy="72" r="3" fill="#1D9E75" />
        <text x="96" y="68" fontSize="8" fill="rgba(255,255,255,0.7)">+22% reach</text>
      </svg>
      <div className="mt-2 flex items-center gap-3 text-[10px] text-white/55">
        <span className="flex items-center gap-1"><span className="h-0.5 w-3 bg-[#7F77DD]" /> Current</span>
        <span className="flex items-center gap-1"><span className="h-0.5 w-3 bg-[#1D9E75]" /> With activation</span>
      </div>
      <div className="mt-3 text-xs text-white/70">
        If you activate today, you'll reach <b className="text-emerald-300">47,200 additional users</b> by Day 30.
      </div>
    </div>
  );
}

function ConversionMatrix() {
  const rows = ["High-LTV", "Mid-Value", "New Visitors"];
  const cols = ["Meta", "Email", "WhatsApp"];
  const data = [
    [65, 78, 91],
    [58, 61, 49],
    [34, 22, 41],
  ];
  const best = { r: 0, c: 2 };
  const cellColor = (v: number) =>
    v >= 75 ? "bg-emerald-500/30 text-emerald-200" :
    v >= 50 ? "bg-amber-500/25 text-amber-200" :
    "bg-rose-500/25 text-rose-200";
  return (
    <div className="rounded-lg border border-white/[0.06] bg-[#0f1117] p-4">
      <div className="text-sm font-medium mb-3">Conversion Probability Matrix</div>
      <div className="grid grid-cols-[80px_repeat(3,1fr)] gap-1.5 text-[10px]">
        <div></div>
        {cols.map((c) => <div key={c} className="text-center text-white/55">{c}</div>)}
        {rows.map((row, ri) => (
          <React.Fragment key={`row-${ri}`}>
            <div className="flex items-center text-white/55">{row}</div>
            {cols.map((_, ci) => {
              const v = data[ri][ci];
              const isBest = ri === best.r && ci === best.c;
              return (
                <div key={`${ri}-${ci}`} className={cn(
                  "rounded-md text-center py-3 font-semibold text-sm",
                  cellColor(v),
                  isBest && "ring-2 ring-emerald-400 animate-pulse"
                )}>{v}%</div>
              );
            })}
          </React.Fragment>
        ))}
      </div>
      <div className="mt-3 text-[11px] text-white/55">Best lane: <span className="text-emerald-300">High-LTV × WhatsApp</span></div>
    </div>
  );
}

function ChurnTimeline() {
  const steps = [
    { day: "Day 0", text: "Last engagement", color: "bg-emerald-400", ring: "" },
    { day: "Day 7", text: "Engagement drop detected", color: "bg-amber-400", ring: "" },
    { day: "Day 14", text: "High churn risk — re-engage", color: "bg-rose-500", ring: "ring-2 ring-rose-400/50 animate-pulse" },
    { day: "Day 21", text: "Predicted lapse", color: "bg-rose-600", ring: "" },
  ];
  return (
    <div className="rounded-lg border border-white/[0.06] bg-[#0f1117] p-4">
      <div className="text-sm font-medium mb-3">Churn Prediction Timeline</div>
      <div className="relative pl-5">
        <div className="absolute left-[7px] top-1 bottom-12 w-px bg-white/10" />
        {steps.map((s) => (
          <div key={s.day} className="relative mb-3 last:mb-2">
            <span className={cn("absolute -left-5 top-1.5 h-3 w-3 rounded-full", s.color, s.ring)} />
            <div className="text-[11px] text-white/45">{s.day}</div>
            <div className="text-xs text-white/85">{s.text}</div>
          </div>
        ))}
        <div className="rounded-md border border-rose-400/30 bg-rose-500/10 px-3 py-2 text-xs text-rose-200 mt-3">
          <div className="text-[10px] uppercase text-rose-300/70">Day 30</div>
          Estimated lost revenue: <b>$8,400</b>
        </div>
      </div>
      <div className="mt-3 text-xs text-white/70">
        <b className="text-amber-300">3,120 users</b> currently at Day 14 stage — act now
      </div>
      <button
        onClick={() => toast.success("Re-engagement sequence queued for 3,120 users")}
        className="mt-2 w-full text-xs px-3 py-1.5 rounded-md bg-amber-500/15 border border-amber-400/40 text-amber-200 hover:bg-amber-500/25"
      >Send Re-engagement</button>
    </div>
  );
}

// ============ PLATFORM REACH ============
function PlatformReach({ country }: { country: Country }) {
  const adjust = (base: number) => {
    const f = country.code === "BD" ? 1 : country.code === "US" ? 1.15 : country.code === "IN" ? 0.95 : 1.05;
    return Math.min(99, Math.round(base * f));
  };
  const data = PLATFORMS_BD.map((p) => ({ ...p, reach: adjust(p.reach) }));
  const colors = ["#7F77DD", "#1D9E75", "#EF9F27", "#4FB7D8"];

  return (
    <Card className="mt-5">
      <div className="flex items-center justify-between mb-4">
        <div className="text-sm font-semibold flex items-center gap-2"><Rocket className="h-4 w-4 text-[#7F77DD]" /> Platform Reach Distribution</div>
        <div className="text-xs text-white/45">{country.flag} {country.name}</div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        {data.map((p, i) => (
          <div key={p.name} className="rounded-lg border border-white/[0.06] bg-[#0f1117] p-4 hover:bg-white/[0.02] transition">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="text-xl">{p.icon}</span>
                <div className="text-sm font-medium">{p.name}</div>
              </div>
              <ConfidenceRing pct={p.reach} size={40} color={colors[i]} />
            </div>
            <div className="space-y-1.5 text-xs">
              <Row k="Reach" v={`${p.reach}%`} />
              <Row k="CPM" v={p.cpm} />
              <Row k="Best Format" v={p.format} />
              <Row k="Peak" v={p.peak} />
              {p.extra && <Row k="CTR" v={p.extra} />}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex justify-between"><span className="text-white/45">{k}</span><span className="text-white/85">{v}</span></div>
  );
}

// ============ AI INSIGHT STRIP ============
function AIInsightStrip({ onAsk, country }: { onAsk: (msg: string) => void; country: string }) {
  const cards = [
    {
      icon: Clock, title: "Timing Intelligence",
      body: `Your top audience (Fitness Enthusiasts in ${country}) is 3.2× more responsive on weekday evenings (7–9pm). Campaigns launched Tue–Thu outperform weekend launches by 41%.`,
      cta: "Apply Timing Suggestion ↗",
      prompt: "Apply optimal launch timing (Tue–Thu, 7–9pm) to all active campaigns",
    },
    {
      icon: AlertTriangle, title: "Overlap Alert",
      body: "Fitness Enthusiasts and Online Shoppers share 38% of users. Running concurrent campaigns will increase CPM by ~22%. Recommend sequencing campaigns 7 days apart.",
      cta: "Resolve Overlap ↗",
      prompt: "Sequence overlapping campaigns 7 days apart to reduce CPM",
    },
    {
      icon: Rocket, title: "Emerging Opportunity",
      body: `Eco-conscious Consumers in ${country} grew +312% in 90 days. Currently underpriced (CPM $0.22). Recommend first-mover positioning now.`,
      cta: "Explore Audience ↗",
      prompt: "Build first-mover campaign for Eco-conscious Consumers",
    },
  ];
  return (
    <div className="mt-5 rounded-xl border border-white/[0.08] bg-[#1a1d2e] p-5 relative overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.4)]">
      <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-[#7F77DD] to-[#1D9E75]" />
      <div className="flex items-center gap-2 mb-4 pl-2">
        <Brain className="h-4 w-4 text-[#7F77DD]" />
        <div className="text-sm font-semibold">AI Audience Advisor</div>
        <Sparkles className="h-3.5 w-3.5 text-[#7F77DD]" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pl-2">
        {cards.map((c) => (
          <div key={c.title} className="rounded-lg border border-white/[0.06] bg-[#0f1117] p-4">
            <div className="flex items-center gap-2 mb-2">
              <c.icon className="h-4 w-4 text-[#7F77DD]" />
              <div className="text-sm font-medium">{c.title}</div>
            </div>
            <div className="text-xs text-white/65 leading-relaxed">{c.body}</div>
            <button onClick={() => onAsk(c.prompt)} className="mt-3 text-xs text-[#C8C3FF] hover:text-white">{c.cta}</button>
          </div>
        ))}
      </div>
    </div>
  );
}
