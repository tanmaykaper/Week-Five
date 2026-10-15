import { PoolStage } from "@/components/pool/PoolStage";

/**
 * The mirror and the week-24 illustration share one pool, so going from one to the other
 * moves the camera through the rings instead of reloading the water.
 */
export default function MirrorLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <PoolStage />
      {children}
    </>
  );
}
