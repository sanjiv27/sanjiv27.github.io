/** Require both targets to be >=50% visible for one uninterrupted second. */
export function observeResearch(onView: () => boolean): () => void {
  const heading = document.getElementById("research-heading");
  const entry = document.getElementById("research-first-entry");
  if (!heading || !entry || typeof IntersectionObserver === "undefined") return () => {};
  const visible = new Set<Element>();
  let timer: ReturnType<typeof setTimeout> | undefined;
  let recorded = false;
  const cancel = () => { if (timer !== undefined) clearTimeout(timer); timer = undefined; };
  const update = () => {
    cancel();
    if (!recorded && !document.hidden && visible.size === 2) {
      timer = setTimeout(() => {
        timer = undefined;
        recorded = onView();
        if (recorded) observer.disconnect();
      }, 1000);
    }
  };
  const observer = new IntersectionObserver(entries => {
    for (const item of entries) {
      if (item.isIntersecting && item.intersectionRatio >= 0.5) visible.add(item.target);
      else visible.delete(item.target);
    }
    update();
  }, { threshold: [0, 0.5] });
  observer.observe(heading);
  observer.observe(entry);
  document.addEventListener("visibilitychange", update);
  return () => { cancel(); observer.disconnect(); document.removeEventListener("visibilitychange", update); };
}
