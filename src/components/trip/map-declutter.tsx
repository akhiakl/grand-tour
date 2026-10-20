"use client";

import { useEffect } from "react";
import { useMap } from "react-leaflet";

import { declutter, mirrorX, type LabelCandidate } from "./declutter";

const FLIP = "marker-flip";
const HIDE_LABEL = "marker-lbl-hidden";
const HIDE_BADGE = "leg-badge-hidden";

/** Measures every stop label and leg badge in the pane and resolves overlaps. */
function resolve(pane: HTMLElement, viewport: DOMRect) {
  const markers = [...pane.querySelectorAll<HTMLElement>(".marker")];
  const badges = [...pane.querySelectorAll<HTMLElement>(".leg-badge")];
  markers.forEach((marker) => marker.classList.remove(FLIP, HIDE_LABEL));
  badges.forEach((badge) => badge.classList.remove(HIDE_BADGE));

  // Selected stop first, then route stops in order, then ghost suggestions.
  const rank = (marker: HTMLElement) => {
    if (marker.classList.contains("marker-active")) return 0;
    return marker.classList.contains("marker-ghost") ? 2 : 1;
  };
  const ordered = markers
    .map((marker, index) => ({ marker, index }))
    .sort((a, b) => rank(a.marker) - rank(b.marker) || a.index - b.index);

  const obstacles = markers.flatMap((marker) => {
    const dot = marker.querySelector(".marker-dot");
    return dot ? [dot.getBoundingClientRect()] : [];
  });
  const labels: LabelCandidate[] = ordered.flatMap(({ marker, index }) => {
    const label = marker.querySelector(".marker-lbl");
    const dot = marker.querySelector(".marker-dot");
    if (!label || !dot) return [];
    const box = label.getBoundingClientRect();
    const dotBox = dot.getBoundingClientRect();
    const centerX = (dotBox.left + dotBox.right) / 2;
    return [
      {
        id: String(index),
        options: [box, mirrorX(box, centerX)],
        keep: marker.classList.contains("marker-active"),
      },
    ];
  });

  const { placement, hiddenBadges } = declutter({
    labels,
    badges: badges.map((badge, index) => ({
      id: String(index),
      box: badge.getBoundingClientRect(),
    })),
    obstacles,
    viewport,
  });

  placement.forEach((choice, id) => {
    const marker = markers[Number(id)];
    if (choice === 1) marker.classList.add(FLIP);
    if (choice === null) marker.classList.add(HIDE_LABEL);
  });
  hiddenBadges.forEach((id) => badges[Number(id)].classList.add(HIDE_BADGE));
}

/**
 * Keeps stop labels and transport badges legible: re-resolves overlaps
 * after every zoom/pan and whenever markers are (re)created.
 */
export function MapDeclutter() {
  const map = useMap();

  useEffect(() => {
    const pane = map.getPane("markerPane");
    if (!pane) return;
    let frame = 0;
    const run = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() =>
        resolve(pane, map.getContainer().getBoundingClientRect()),
      );
    };
    const observer = new MutationObserver(run);
    observer.observe(pane, { childList: true });
    map.on("zoomend moveend resize", run);
    run();

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      map.off("zoomend moveend resize", run);
    };
  }, [map]);

  return null;
}
