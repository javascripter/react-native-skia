import type { ComponentProps, ComponentType } from "react";
import React, { useState, useEffect, useMemo, lazy, Suspense } from "react";

import { Platform } from "../Platform";

import { LoadSkiaWeb } from "./LoadSkiaWeb";

interface WithSkiaProps {
  fallback?: ComponentProps<typeof Suspense>["fallback"];
  getComponent: () => Promise<{ default: ComponentType }>;
  opts?: Parameters<typeof LoadSkiaWeb>[0];
}

export const WithSkiaWeb = ({
  getComponent,
  fallback,
  opts,
}: WithSkiaProps) => {
  const [isSkiaLoaded, setIsSkiaLoaded] = useState(false);
  const Inner = useMemo(
    // TODO: investigate
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (): any =>
      lazy(async () => {
        if (Platform.OS !== "web") {
          console.warn(
            "<WithSkiaWeb /> is only necessary on web. Consider not using on native."
          );
        }
        return getComponent();
      }),
    [getComponent, opts]
  );

  useEffect(() => {
    LoadSkiaWeb(opts)
      .then(() => {
        setIsSkiaLoaded(true);
      })
      .catch((error) => {
        // Throwing inside setState surfaces the error to the nearest error boundary
        setIsSkiaLoaded(() => {
          throw error;
        });
      });
  }, [opts]);

  if (!isSkiaLoaded) {
    return <>{fallback}</>;
  }

  return (
    <Suspense fallback={fallback ?? null}>
      <Inner />
    </Suspense>
  );
};
