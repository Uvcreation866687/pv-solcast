import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { HelpCircle, MessageSquarePlus, Send, Star, Zap } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";

const FAQ_ITEMS = [
  {
    id: "faq-1",
    question: "How do I read the Performance Ratio value?",
    answer:
      "Performance Ratio (PR) is the ratio of actual energy output to the theoretical maximum. In India, a PR of 75–82% is considered excellent for ground-mount systems. Values below 70% indicate significant losses from dust, shading, temperature, or inverter inefficiency. The PV SolCast analytics tab shows your system's PR month-by-month — look for dips in summer (Apr–Jun) due to high ambient temperatures increasing heat losses.",
  },
  {
    id: "faq-2",
    question:
      "What is Specific Yield and what does 1400–1600 kWh/kWp mean for India?",
    answer:
      "Specific Yield (kWh/kWp) measures how much energy each kilowatt-peak of installed capacity produces annually. For India: Rajasthan/Gujarat desert zones achieve 1,800–2,000 kWh/kWp, peninsular India (Andhra, Karnataka) yields 1,500–1,700 kWh/kWp, Indo-Gangetic plain (Delhi, UP) achieves 1,400–1,600 kWh/kWp, and northeastern/coastal zones may be 1,200–1,400 kWh/kWp due to higher cloud cover and humidity. A 1 kWp rooftop system producing 1,500 kWh/year is performing well for most of India.",
  },
  {
    id: "faq-3",
    question:
      "Why does solar production drop sharply in monsoon months (Jun–Sep)?",
    answer:
      "Three compounding factors cause monsoon production drops in India: (1) Cloud cover — monsoon clouds can reduce irradiance by 60–80% on overcast days, (2) Reduced Global Horizontal Irradiance (GHI) — the June–August GHI in Kerala, Maharashtra, and Odisha can fall to 3–4 kWh/m²/day vs 6–7 in winter, (3) Lower sun altitude angle during the monsoon season in parts of India. However, monsoon rain also washes dust off panels, which partially offsets losses through improved transmission. PV SolCast models this with regional cloud cover climatology.",
  },
  {
    id: "faq-4",
    question: "What does the System Losses Distribution chart show?",
    answer:
      "The System Losses Distribution shows where your system's theoretical maximum output is reduced. Key components: Temperature Loss (typically 5–12% in India's summers — hot panels produce less), Soiling Loss (dust reduces transmission; can be 5–15% in Rajasthan), Wiring Loss (resistance losses in DC/AC wiring, usually 2–3%), Inverter Efficiency Loss (modern string inverters are 97–98% efficient), Mismatch Loss (panel-to-panel variation, ~1–2%), and IAM Loss (Angle of Incidence Modifier — light hitting at shallow angles reflects off glass). Hover over each slice to see the exact percentage.",
  },
  {
    id: "faq-5",
    question: "How accurate are the solar production forecasts?",
    answer:
      "PV SolCast forecasts are computed using a solar geometry engine with India-specific climate models. Short-term accuracy (24–48 hours) for clear-sky conditions is typically within 5–8% of actual production. Monsoon months have higher uncertainty (±15–25%) due to unpredictable cloud cover. The forecasts use historical GHI climatology, seasonal temperature profiles, and monsoon onset/offset patterns calibrated for each Indian climate zone. For bankable accuracy, we recommend validating against 12+ months of actual meter readings from your site.",
  },
  {
    id: "faq-6",
    question: "What is a good Performance Ratio for India?",
    answer:
      "India-specific benchmarks: Excellent (≥80%): Modern bifacial plants in Rajasthan/Gujarat with tracker systems, Good (75–80%): Well-maintained fixed-tilt ground-mount in high-irradiance zones, Average (70–75%): Typical rooftop installation in tier-2 cities, Below Average (<70%): Old panels, heavy soiling, shading issues, or significant mismatch. Monsoon-season PR naturally dips to 68–72% even for well-maintained systems. Annual PR of 78% is a common benchmark used by Indian solar developers for project financing.",
  },
  {
    id: "faq-7",
    question: "How does temperature affect solar panel output?",
    answer:
      "Standard silicon solar panels lose approximately 0.35–0.45% of their rated power for every 1°C rise above 25°C (STC). During Indian summers, panel surface temperatures can reach 60–70°C on clear afternoons, reducing output by 12–20% compared to the nameplate rating. This is why India's peak production often occurs in February–March rather than May–June — irradiance is high but temperatures are still moderate. Bifacial panels, cooling mounting structures, and PERC/TOPCon technology have lower temperature coefficients (~0.30%) and perform better in Indian heat.",
  },
  {
    id: "faq-8",
    question: "What is the difference between kWp and kWh?",
    answer:
      "kWp (kilowatt-peak) is the nameplate DC capacity of your solar panels — measured at Standard Test Conditions (STC: 1000 W/m² irradiance, 25°C, AM1.5 spectrum). A 10 kWp system has panels rated for 10 kW at perfect lab conditions. kWh (kilowatt-hour) is actual energy produced — what your meter records. A 10 kWp system in Delhi typically produces 14,000–16,000 kWh per year (1,400–1,600 kWh/kWp × 10 kWp). For billing, utilities measure kWh. For sizing and comparing systems, kWp is used. PV SolCast tracks both: kWp in System Config and kWh in Forecast & Analytics.",
  },
  {
    id: "faq-9",
    question: "How does tilt angle affect production in India?",
    answer:
      "Optimal tilt angle in India equals approximately your latitude ± 5°. For New Delhi (28°N), optimal fixed tilt is 24–32°. Key effects: Too flat (<15°) — dust accumulates faster (soiling losses up 3–5%), rain doesn't clean panels well; Optimal tilt — maximum annual production; Steeper tilt — slightly better winter production, worse summer, better self-cleaning. For dual-axis trackers in Rajasthan/Gujarat, production gains of 25–35% over fixed-tilt are achievable. The Analytics tab shows optimal tilt by month for your selected location, and you can experiment with different tilts in System Config.",
  },
  {
    id: "faq-10",
    question:
      "What is the best panel orientation (azimuth) for solar plants in India?",
    answer:
      "Since India is entirely in the Northern Hemisphere (8°N to 37°N), solar panels should always face True South (azimuth 180°) for maximum annual production. Deviations: East (90°): Morning peak production — good for time-of-day tariff arbitrage; West (270°): Afternoon peak — aligns with evening demand; South-East/South-West (±30° from South): Less than 3–5% annual loss vs True South. Never face panels North in India — production loss of 25–40%. Always use True South, not Magnetic South (India's magnetic declination varies from 0° to +2.5°W in most states).",
  },
  {
    id: "faq-11",
    question: "How do I interpret the 25-year savings projection?",
    answer:
      "The 25-year projection in Analytics models cumulative financial savings assuming: (1) 0.5% annual panel degradation (industry standard; quality modules degrade even slower), (2) Annual electricity tariff escalation of 3–5%, (3) System remains operational throughout with normal maintenance. The net present value (NPV) and payback period shown are conservative estimates. Real-world factors that improve the projection: government subsidies (PM Surya Ghar Yojana), net metering credits, carbon credits (RECs), and rising grid tariffs. Factors that worsen it: accelerated degradation from poor maintenance or extreme soiling.",
  },
  {
    id: "faq-12",
    question: "What is GHI vs DNI vs DHI irradiance?",
    answer:
      "GHI (Global Horizontal Irradiance) is total solar energy on a flat horizontal surface — the most commonly used metric. In India, annual GHI ranges from ~1,400 kWh/m² (northeast) to ~2,200 kWh/m² (Rajasthan). DNI (Direct Normal Irradiance) measures direct beam radiation perpendicular to the sun — critical for CSP (Concentrated Solar Power) plants. Rajasthan/Ladakh have India's highest DNI (>700 W/m² on clear days). DHI (Diffuse Horizontal Irradiance) is scattered sky radiation — important on cloudy days. On monsoon overcast days, DHI dominates. PV SolCast uses GHI models with diffuse/direct decomposition for panel angle calculations.",
  },
  {
    id: "faq-13",
    question: "How often should solar panels be cleaned in India?",
    answer:
      "Cleaning frequency by region: Rajasthan/Gujarat desert zones — every 7–10 days during dry season (Oct–May), coastal zones (Mumbai, Chennai, Kochi) — every 14–21 days (sea salt + pollution), Indo-Gangetic plain (Delhi, Lucknow, Kanpur) — every 10–14 days (high PM2.5 aerosols), Monsoon season — natural rain cleaning often suffices during active monsoon. Automated robotic cleaners are increasingly used at large plants (>5 MW). Even a single heavy soiling event can cause 10–15% production loss. Use the soiling factor slider in System Config to see how cleaning frequency affects your annual yield.",
  },
  {
    id: "faq-14",
    question: "How does PM2.5 and dust affect output in northern India?",
    answer:
      "Northern India's severe pollution significantly impacts solar output. High-PM2.5 events (AQI >200) in Delhi-NCR, Punjab, and UP can reduce GHI by 15–30% by scattering and absorbing sunlight before it reaches panels. Dust storm (andhi) season in Rajasthan (April–June) causes episodic losses of 20–40% until cleaned. Post-winter fog season (Jan–Feb) in Punjab/Haryana reduces effective sun hours. Combined annual loss in Delhi compared to purely clear-sky models: approximately 8–12%. PV SolCast models this through the soiling factor setting and regional aerosol climatology built into the forecast engine.",
  },
  {
    id: "faq-15",
    question: "What is a good Capacity Factor for India ground-mount solar?",
    answer:
      "Capacity Factor (CF) = actual annual energy ÷ (rated capacity × 8,760 hours). India benchmarks: High-irradiance zones (Rajasthan, Gujarat) — 22–26% CF, Mid-irradiance zones (Maharashtra, AP, Karnataka) — 18–22% CF, Lower-irradiance zones (Bengal, northeast, Kerala) — 15–18% CF. Globally, a 20% CF for solar is considered good. India's flat-rate CF of ~20–22% for well-sited ground-mount projects is among the best for utility-scale solar globally. Rooftop systems in urban India typically achieve 16–19% CF due to shading and suboptimal tilt.",
  },
  {
    id: "faq-16",
    question: "How is CO₂ offset calculated in PV SolCast?",
    answer:
      "CO₂ offset = Annual Energy (kWh) × India Grid Emission Factor (0.71 kg CO₂/kWh). The 0.71 kg/kWh factor is from India's Central Electricity Authority (CEA) 2023 report and represents the average emissions from coal, gas, and oil-based generation that solar displaces. As India's grid becomes greener (more renewables), this factor will decrease. A 10 kWp rooftop system producing 15,000 kWh/year offsets approximately 10,650 kg (10.65 tonnes) of CO₂ annually — equivalent to planting about 480 trees or not driving a car for ~42,000 km.",
  },
  {
    id: "faq-17",
    question: "How do I compare solar potential between two Indian states?",
    answer:
      "Use the Location Analytics tab: enter two cities one at a time and note their Annual Production, Specific Yield, Performance Ratio, and Best Month values. Key comparison metrics: (1) Annual GHI — available from NIWE (National Institute of Wind Energy) Solar Atlas; (2) Specific Yield — directly shows energy per kWp; (3) Capacity Factor — normalised by rated capacity; (4) Monsoon impact — compare June–September production relative to December–February. The Solar Plants tab also shows real operating plants clustered by state, giving you a quick visual of where India's solar resource is concentrated.",
  },
  {
    id: "faq-18",
    question: "What causes soiling loss in the System Losses chart?",
    answer:
      "Soiling loss occurs when dust, dirt, bird droppings, pollen, and industrial aerosols accumulate on panel glass, blocking light transmission. In India, major soiling sources are: construction dust (common in rapidly urbanising areas), agricultural dust during harvesting seasons, industrial fallout near thermal plants, road dust from heavy vehicle corridors, and sea salt in coastal installations. The soiling factor in System Config (default 0.95 = 5% loss) directly adjusts this value. Studies from IIT Bombay show that panels in Mumbai can lose up to 3% per week without cleaning; in Rajasthan desert, up to 5–7% per week.",
  },
  {
    id: "faq-19",
    question: "How does cloud cover affect forecast accuracy?",
    answer:
      "Cloud cover is the largest source of forecast uncertainty. PV SolCast uses clear-sky models with statistical cloud cover corrections based on India Meteorological Department (IMD) climatology. Under clear skies, production forecasts are accurate to ±5%. Under broken cloud conditions (30–60% cloud cover), uncertainty rises to ±15%. Under deep monsoon overcast (>80% cloud cover), hour-by-hour forecasts may be off by ±25–30%, though daily totals are still reasonable. For operational forecasting, integrating real-time satellite-derived GHI data (e.g., from MOSDAC/ISRO) alongside this model improves accuracy to ±8% even in monsoon.",
  },
  {
    id: "faq-20",
    question: "What is the India grid CO₂ emission factor used in this app?",
    answer:
      "PV SolCast uses 0.71 kg CO₂/kWh — the India national grid emission factor published by the Central Electricity Authority (CEA) in its 'CO2 Baseline Database for the Indian Power Sector' (Version 18, 2023). This is the weighted average of all grid-connected power plants across India. Regional factors vary: Southern Grid (Andhra, Karnataka, Tamil Nadu) — closer to 0.65 kg/kWh (more renewables); Northern Grid (UP, Rajasthan) — closer to 0.78 kg/kWh (more coal). As India accelerates its 500 GW renewable target by 2030, this national factor is expected to drop to 0.45–0.55 kg/kWh by 2030.",
  },
];

const CATEGORY_OPTIONS = [
  { value: "general", label: "General Feedback" },
  { value: "accuracy", label: "Data Accuracy" },
  { value: "feature", label: "Feature Request" },
  { value: "bug", label: "Bug Report" },
];

export function SupportTab() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [category, setCategory] = useState("");
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [message, setMessage] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) {
      toast.error("Please enter a message before submitting.");
      return;
    }
    setIsSubmitted(true);
    toast.success("Thank you for your feedback!", {
      description:
        "Your response has been recorded and will help us improve PV SolCast.",
    });
    // Reset form
    setName("");
    setEmail("");
    setCategory("");
    setRating(0);
    setHoverRating(0);
    setMessage("");
    setTimeout(() => setIsSubmitted(false), 4000);
  };

  const displayRating = hoverRating || rating;

  return (
    <div className="space-y-10 pb-10">
      {/* Page header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="flex items-start gap-4 pt-2"
      >
        <div className="relative mt-1 shrink-0">
          <div className="w-10 h-10 rounded-xl bg-solar-gold/15 border border-solar-gold/30 flex items-center justify-center">
            <HelpCircle className="w-5 h-5 text-solar-gold" />
          </div>
          <div className="absolute inset-0 rounded-xl bg-solar-gold/10 blur-md" />
        </div>
        <div>
          <h1 className="text-2xl font-bold font-display text-foreground leading-tight">
            Support &amp; FAQ
          </h1>
          <p className="text-muted-foreground text-sm mt-1 max-w-2xl">
            Find answers to common questions about solar plant analytics,
            performance metrics, and India-specific solar data — or share your
            feedback to help us improve.
          </p>
        </div>
      </motion.div>

      {/* Stats bar */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.08 }}
        className="grid grid-cols-2 sm:grid-cols-4 gap-3"
      >
        {[
          { label: "FAQ Topics", value: "20", sub: "in this guide" },
          { label: "India Cities", value: "50+", sub: "in Location Analytics" },
          { label: "Solar Plants", value: "120+", sub: "indexed on map" },
          {
            label: "Support Email",
            value: "support@pvsolcast.com",
            sub: "reach us anytime",
          },
        ].map((stat) => (
          <div
            key={stat.label}
            className="bg-card border border-border rounded-xl px-4 py-3"
          >
            <p className="text-xs text-muted-foreground">{stat.label}</p>
            <p className="text-sm font-bold text-solar-gold mt-0.5 truncate">
              {stat.value}
            </p>
            <p className="text-xs text-muted-foreground/70">{stat.sub}</p>
          </div>
        ))}
      </motion.div>

      {/* FAQ Section */}
      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.14 }}
      >
        <div className="flex items-center gap-2.5 mb-4">
          <Zap className="w-4 h-4 text-solar-gold" />
          <h2 className="text-lg font-semibold text-foreground font-display">
            Frequently Asked Questions
          </h2>
          <span className="text-xs text-muted-foreground bg-muted rounded-full px-2 py-0.5 border border-border ml-1">
            {FAQ_ITEMS.length} topics
          </span>
        </div>

        <div className="bg-card border border-border rounded-2xl overflow-hidden">
          <Accordion
            type="single"
            collapsible
            className="divide-y divide-border"
          >
            {FAQ_ITEMS.map((faq, index) => (
              <AccordionItem
                key={faq.id}
                value={faq.id}
                data-ocid="faq.panel"
                className="border-none px-5"
              >
                <AccordionTrigger className="text-sm font-medium text-foreground hover:text-solar-gold hover:no-underline py-4 gap-3 transition-colors [&[data-state=open]]:text-solar-gold">
                  <span className="flex items-center gap-3 text-left">
                    <span className="shrink-0 w-6 h-6 rounded-full bg-solar-gold/10 border border-solar-gold/25 text-solar-gold text-xs font-bold flex items-center justify-center">
                      {index + 1}
                    </span>
                    {faq.question}
                  </span>
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground leading-relaxed pl-9">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </motion.section>

      {/* Feedback Section */}
      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.22 }}
      >
        <div className="flex items-center gap-2.5 mb-4">
          <MessageSquarePlus className="w-4 h-4 text-solar-teal" />
          <h2 className="text-lg font-semibold text-foreground font-display">
            Share Your Feedback
          </h2>
        </div>

        <div className="bg-card border border-border rounded-2xl p-6 sm:p-8 max-w-2xl">
          <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
            Help us make PV SolCast better for every solar developer,
            researcher, and enthusiast across India. Your feedback is directly
            reviewed by the team.
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Name + Email */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label
                  htmlFor="feedback-name"
                  className="text-xs text-muted-foreground uppercase tracking-wide"
                >
                  Name
                </Label>
                <Input
                  id="feedback-name"
                  data-ocid="feedback.input"
                  placeholder="Your name (optional)"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="bg-background border-border text-foreground placeholder:text-muted-foreground/60 focus:border-solar-gold focus:ring-solar-gold/20"
                />
              </div>
              <div className="space-y-1.5">
                <Label
                  htmlFor="feedback-email"
                  className="text-xs text-muted-foreground uppercase tracking-wide"
                >
                  Email
                </Label>
                <Input
                  id="feedback-email"
                  data-ocid="feedback.input"
                  type="email"
                  placeholder="your@email.com (optional)"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-background border-border text-foreground placeholder:text-muted-foreground/60 focus:border-solar-gold focus:ring-solar-gold/20"
                />
              </div>
            </div>

            {/* Category */}
            <div className="space-y-1.5">
              <Label
                htmlFor="feedback-category"
                className="text-xs text-muted-foreground uppercase tracking-wide"
              >
                Category
              </Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger
                  id="feedback-category"
                  data-ocid="feedback.select"
                  className="bg-background border-border text-foreground focus:border-solar-gold focus:ring-solar-gold/20"
                >
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border">
                  {CATEGORY_OPTIONS.map((opt) => (
                    <SelectItem
                      key={opt.value}
                      value={opt.value}
                      className="text-foreground focus:bg-solar-gold/10 focus:text-solar-gold"
                    >
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Star Rating */}
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground uppercase tracking-wide">
                Overall Rating
              </Label>
              <div className="flex items-center gap-1.5">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    data-ocid={
                      `feedback.star_rating.${star}` as `feedback.star_rating.${1 | 2 | 3 | 4 | 5}`
                    }
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    aria-label={`Rate ${star} star${star !== 1 ? "s" : ""}`}
                    className="transition-transform hover:scale-110 active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-solar-gold/50 rounded"
                  >
                    <Star
                      className={`w-7 h-7 transition-colors ${
                        star <= displayRating
                          ? "text-solar-gold fill-solar-gold"
                          : "text-muted-foreground/40"
                      }`}
                    />
                  </button>
                ))}
                {rating > 0 && (
                  <span className="ml-2 text-xs text-muted-foreground">
                    {
                      ["", "Poor", "Fair", "Good", "Very Good", "Excellent"][
                        rating
                      ]
                    }
                  </span>
                )}
              </div>
            </div>

            {/* Message */}
            <div className="space-y-1.5">
              <Label
                htmlFor="feedback-message"
                className="text-xs text-muted-foreground uppercase tracking-wide"
              >
                Message <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="feedback-message"
                data-ocid="feedback.textarea"
                placeholder="Tell us what you think — a feature request, a data accuracy issue, or just what you enjoy about PV SolCast..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={4}
                className="bg-background border-border text-foreground placeholder:text-muted-foreground/60 focus:border-solar-gold focus:ring-solar-gold/20 resize-none"
                required
              />
              <p className="text-xs text-muted-foreground/60">
                Required — minimum one sentence
              </p>
            </div>

            {/* Submit */}
            <div className="flex items-center gap-3 pt-1">
              <Button
                type="submit"
                data-ocid="feedback.submit_button"
                className="bg-solar-gold hover:bg-solar-amber text-background font-semibold px-6 gap-2 transition-all"
                disabled={isSubmitted}
              >
                <Send className="w-4 h-4" />
                {isSubmitted ? "Sent!" : "Send Feedback"}
              </Button>

              {isSubmitted && (
                <motion.div
                  data-ocid="feedback.success_state"
                  initial={{ opacity: 0, x: 8 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center gap-1.5 text-sm text-solar-green"
                >
                  <span className="w-2 h-2 rounded-full bg-solar-green animate-pulse" />
                  Feedback received — thank you!
                </motion.div>
              )}
            </div>
          </form>
        </div>
      </motion.section>

      {/* Help Links */}
      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.28 }}
        className="grid grid-cols-1 sm:grid-cols-3 gap-4"
      >
        {[
          {
            title: "Data Sources",
            desc: "India CEA, IMD, NIWE, MNRE, and ISRO MOSDAC solar atlases underpin our forecast models.",
            icon: "🗂️",
          },
          {
            title: "Disclaimer",
            desc: "Forecasts are indicative and based on climatological models. Always validate with on-site measurements before investment decisions.",
            icon: "⚠️",
          },
          {
            title: "Contact",
            desc: "For partnership enquiries or bulk data access, email support@pvsolcast.com or visit www.pvsolcast.com.",
            icon: "📧",
          },
        ].map((card) => (
          <div
            key={card.title}
            className="bg-card border border-border rounded-xl p-5 space-y-2"
          >
            <span className="text-2xl">{card.icon}</span>
            <h3 className="text-sm font-semibold text-foreground">
              {card.title}
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {card.desc}
            </p>
          </div>
        ))}
      </motion.section>
    </div>
  );
}
