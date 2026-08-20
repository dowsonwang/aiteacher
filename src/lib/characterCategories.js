export const characterCategoryTabs = [
  { key: "all", label: "All", path: "/browse" },
  { key: "female", label: "Female", path: "/girls" },
  { key: "male", label: "Male", path: "/boys" },
  { key: "anime", label: "Anime", path: "/anime" },
];

export const getCharacterCategoryFromPath = (pathname) => {
  const normalizedPath = pathname?.length > 1 && pathname.endsWith("/") ? pathname.slice(0, -1) : pathname;
  const tab = characterCategoryTabs.find((item) => item.path === normalizedPath);
  return tab?.key || null;
};
