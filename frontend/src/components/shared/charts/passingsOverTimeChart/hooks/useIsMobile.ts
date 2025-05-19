import { useState, useEffect } from "react";
import { MOBILE_MAX_WIDTH } from "@/config/config";

export default function useIsMobile(maxWidth = MOBILE_MAX_WIDTH) {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const checkSize = () => setIsMobile(window.innerWidth <= maxWidth);
    checkSize();
    window.addEventListener("resize", checkSize);
    return () => window.removeEventListener("resize", checkSize);
  }, [maxWidth]);
  return isMobile;
}
