import { describe, expect, it } from "vitest";
import { centreSquare, LIGHT_BRIGHT, LIGHT_DARK, lightStatus, MAX_SIDE, meanLuminance, meterPosition, outputSide, photoId } from "@/lib/camera";

const px = (...rgba: number[][]) => new Uint8ClampedArray(rgba.flat());

describe("light", () => {
  it("splits at 70 and 190, inclusive of the good range", () => {
    expect(lightStatus(LIGHT_DARK - 1)).toBe("dark");
    expect(lightStatus(LIGHT_DARK)).toBe("good");
    expect(lightStatus(128)).toBe("good");
    expect(lightStatus(LIGHT_BRIGHT)).toBe("good");
    expect(lightStatus(LIGHT_BRIGHT + 1)).toBe("bright");
  });

  it("averages luma with Rec. 709 weights", () => {
    expect(meanLuminance(px([255, 255, 255, 255]))).toBeCloseTo(255);
    expect(meanLuminance(px([0, 0, 0, 255]))).toBe(0);
    // Green carries most of the brightness, blue the least.
    expect(meanLuminance(px([0, 255, 0, 255]))).toBeCloseTo(182.4, 0);
    expect(meanLuminance(px([0, 0, 255, 255]))).toBeCloseTo(18.4, 0);
    expect(meanLuminance(px([255, 255, 255, 255], [0, 0, 0, 255]))).toBeCloseTo(127.5);
  });

  it("skips transparent pixels and copes with nothing", () => {
    expect(meanLuminance(px([255, 255, 255, 255], [0, 0, 0, 0]))).toBeCloseTo(255);
    expect(meanLuminance(new Uint8ClampedArray())).toBe(0);
  });

  it("places readings on the meter between 0 and 1", () => {
    expect(meterPosition(-5)).toBe(0);
    expect(meterPosition(255)).toBe(1);
    expect(meterPosition(400)).toBe(1);
    expect(meterPosition(127.5)).toBeCloseTo(0.5);
  });
});

describe("crop", () => {
  it("keeps the centred square of landscape and portrait frames", () => {
    expect(centreSquare(1920, 1080)).toEqual({ sx: 420, sy: 0, side: 1080 });
    expect(centreSquare(1080, 1920)).toEqual({ sx: 0, sy: 420, side: 1080 });
    expect(centreSquare(800, 800)).toEqual({ sx: 0, sy: 0, side: 800 });
  });

  it("never upscales and never goes past 1600 px", () => {
    expect(outputSide(720)).toBe(720);
    expect(outputSide(3024)).toBe(MAX_SIDE);
    expect(outputSide(0)).toBe(1);
  });

  it("gives every photo its own id, with the view and week in it", () => {
    const a = photoId("crown", 0);
    expect(a).toMatch(/^p-crown-w0-/);
    expect(photoId("crown", 0)).not.toBe(a);
  });
});
