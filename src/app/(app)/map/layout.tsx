import { PoolStage } from "@/components/pool/PoolStage";

/**
 * The map and its 24 week pages share one pool, so moving from week to week moves the
 * camera through the rings instead of reloading the water.
 */
export default function MapLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <PoolStage />
      {children}
    </>
  );
}
