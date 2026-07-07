"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

export function BootScreen() {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const [visible, setVisible] = useState(true);
  const [routeKey, setRouteKey] = useState(pathname);

  useEffect(() => {
    setRouteKey(pathname);
    setVisible(true);

    const duration = isHome ? 900 : 720;
    const timer = window.setTimeout(() => setVisible(false), duration);

    return () => window.clearTimeout(timer);
  }, [pathname, isHome]);

  if (!visible) return null;

  return (
    <div className="bootScreen bootScreenRoute" key={routeKey}>
      <div className="bootBox">
        <span>{isHome ? "ACCESSING INDEX..." : "OPENING FILE..."}</span>
        <i />
        <p>{isHome ? "> SIGNAL ACTIVE // INDEX VERIFIED" : "> SIGNAL ACTIVE // ROUTE VERIFIED"}</p>
      </div>
    </div>
  );
}
