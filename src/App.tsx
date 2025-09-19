import "@radix-ui/themes/styles.css";
import {
  Theme,
  Flex,
  Box,
  Heading,
  Text,
  Separator,
  TextField,
  Checkbox,
  Select,
  TextArea,
  Button,
  Link,
} from "@radix-ui/themes";
import * as React from "react";
import { DOG_B64 } from "./wolfie.ts";

/** ---------- helpers ---------- */
const joinGroup = (items: string[], op: "AND" | "OR") =>
  items.length <= 1 ? items.join("") : `(${items.join(` ${op} `)})`;

const buildQuery = (
  site: string,
  types: string[],
  keywords: string[],
  kwJoin: "AND" | "OR"
) => {
  const sitePart = site.trim() ? `site:${site.trim()}` : "";
  const q = (s: string) => `"${s.trim().replace(/"/g, '\\"')}"`;
  const typePart = joinGroup(types.map(q), "OR");
  const kwPart = joinGroup(keywords.map(q), kwJoin);
  const rhs = [typePart, kwPart].filter(Boolean).join(" AND ");
  return [sitePart, rhs].filter(Boolean).join(" ");
};

/** ---------- keyword presets ---------- */
const PRESETS: Record<string, string[]> = {
  Frontend: ["react", "typescript", "angular", "vue", "next.js", "vite"],
  Backend: ["node", "express", "django", "flask", "spring boot", "graphql"],
  Mobile: ["react native", "flutter", "swift", "kotlin", "android", "ios"],
};

export default function App() {
  const [site, setSite] = React.useState("github.com");

  const TYPE_OPTIONS = [
    "frontend",
    "backend",
    "devops",
    "data",
    "mobile",
    "fullstack",
  ];
  const [types, setTypes] = React.useState<string[]>(["frontend"]); // preselected

  const [kwJoin, setKwJoin] = React.useState<"AND" | "OR">("OR");

  // Preselect "react" + "typescript" in Frontend group
  const [selectedPreset, setSelectedPreset] = React.useState<
    Record<string, Set<string>>
  >(() => {
    const initial: Record<string, Set<string>> = {};
    Object.keys(PRESETS).forEach((k) => (initial[k] = new Set<string>()));
    initial.Frontend.add("react");
    initial.Frontend.add("typescript");
    return initial;
  });

  const [extraCsv, setExtraCsv] = React.useState("");

  const keywords = React.useMemo(() => {
    const fromPresets = Object.values(selectedPreset).flatMap((set) =>
      Array.from(set)
    );
    const fromCsv = extraCsv
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    return Array.from(new Set([...fromPresets, ...fromCsv]));
  }, [selectedPreset, extraCsv]);

  const query = React.useMemo(
    () => buildQuery(site, types, keywords, kwJoin),
    [site, types, keywords, kwJoin]
  );

  const googleHref = query
    ? `https://www.google.com/search?q=${encodeURIComponent(query)}`
    : "#";

  const [copied, setCopied] = React.useState(false);
  const copy = async () => {
    if (!query) return;
    await navigator.clipboard.writeText(query);
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  };

  const toggleType = (name: string, checked: boolean) =>
    setTypes((prev) =>
      checked ? [...new Set([...prev, name])] : prev.filter((t) => t !== name)
    );

  const togglePresetKeyword = (group: string, term: string, checked: boolean) =>
    setSelectedPreset((prev) => {
      const next = { ...prev, [group]: new Set(prev[group]) };
      if (checked) next[group].add(term);
      else next[group].delete(term);
      return next;
    });

  // Hover state for the floating G button (for transition styles)
  const [gHover, setGHover] = React.useState(false);
  const gDisabled = !query;

  return (
    <Theme appearance="light" accentColor="indigo">
      {/* position:relative so we can float the Google button */}
      <Box style={{ position: "relative" }}>
        {/* Floating circular Google link (just the G) */}
        <Box style={{ position: "fixed", top: 16, right: 16, zIndex: 10 }}>
          <Link
            href={googleHref}
            target="_blank"
            rel="noreferrer"
            aria-label="Open in Google"
            onMouseEnter={() => setGHover(true)}
            onMouseLeave={() => setGHover(false)}
            style={{
              width: 44,
              height: 44,
              borderRadius: "50%",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              background: "#fff",
              boxShadow: gHover
                ? "0 8px 20px rgba(0,0,0,0.20)"
                : "0 4px 12px rgba(0,0,0,0.14)",
              transform: gHover ? "translateY(-1px)" : "translateY(0)",
              transition: "box-shadow 150ms ease, transform 150ms ease",
              opacity: gDisabled ? 0.5 : 1,
              pointerEvents: gDisabled ? "none" : "auto",
            }}
          >
            {/* Multicolor Google "G" */}
            <svg width="20" height="20" viewBox="0 0 48 48" aria-hidden="true">
              <path
                fill="#FFC107"
                d="M43.6 20.5H42V20H24v8h11.3C33.7 32.4 29.3 36 24 36c-6.6 0-12-5.4-12-12S17.4 12 24 12c3 0 5.7 1.1 7.8 3l5.7-5.7C34 5.7 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20c10.4 0 19-8 19-20 0-1.3-.1-2.2-.4-3.5z"
              />
              <path
                fill="#FF3D00"
                d="M6.3 14.7l6.6 4.8C14.9 16.3 18.9 12 24 12c3 0 5.7 1.1 7.8 3l5.7-5.7C34 5.7 29.3 4 24 4 15.3 4 7.9 9.2 6.3 14.7z"
              />
              <path
                fill="#4CAF50"
                d="M24 44c5.2 0 9.9-1.7 13.5-4.7l-6.2-5.1C29.2 35.4 26.8 36 24 36c-5.2 0-9.6-3.3-11.2-7.9l-6.6 5.1C8 38.8 15.4 44 24 44z"
              />
              <path
                fill="#1976D2"
                d="M43.6 20.5H42V20H24v8h11.3c-1.2 3.4-4.5 6-8.3 6-5.2 0-9.6-3.3-11.2-7.9l-6.6 5.1C8 38.8 15.4 44 24 44c10.4 0 19-8 19-20 0-1.3-.1-2.2-.4-3.5z"
              />
            </svg>
          </Link>
        </Box>

        <Flex
          direction="column"
          gap="4"
          style={{ maxWidth: 720, margin: "32px auto" }}
        >
          {/* Header with mascot */}
          <Flex align="center" gap="2">
            <img
              src={`data:image/png;base64,${DOG_B64}`}
              alt="Mascot"
              width={40}
              height={40}
              style={{
                display: "block",
                objectFit: "contain",
                filter: "drop-shadow(0px 2px 6px rgba(0,0,0,0.15))",
              }}
            />
            <Heading size="4">Boolean Query Builder</Heading>
          </Flex>

          {/* Site */}
          <Box>
            <Text as="label" size="2">
              Site
            </Text>
            <TextField.Root
              value={site}
              onChange={(e) => setSite((e.target as HTMLInputElement).value)}
            />
          </Box>

          <Separator />

          {/* Type (inline, wrapping) */}
          <Box>
            <Text size="2" mb="2">
              Type
            </Text>
            <Flex wrap="wrap" gap="3">
              {TYPE_OPTIONS.map((t) => (
                <label
                  key={t}
                  style={{ display: "flex", gap: 8, alignItems: "center" }}
                >
                  <Checkbox
                    checked={types.includes(t)}
                    onCheckedChange={(c) => toggleType(t, Boolean(c))}
                  />
                  {t}
                </label>
              ))}
            </Flex>
          </Box>

          <Separator />

          {/* Keywords */}
          <Box>
            <Flex justify="between" align="center" mb="2">
              <Text size="2">Keywords</Text>
              <Flex align="center" gap="2">
                <Text size="2">Join</Text>
                <Select.Root
                  value={kwJoin}
                  onValueChange={(v) => setKwJoin(v as "AND" | "OR")}
                >
                  <Select.Trigger />
                  <Select.Content>
                    <Select.Item value="AND">AND</Select.Item>
                    <Select.Item value="OR">OR</Select.Item>
                  </Select.Content>
                </Select.Root>
              </Flex>
            </Flex>

            {Object.entries(PRESETS).map(([group, terms]) => (
              <Box key={group} mb="3">
                <Text weight="bold">{group}</Text>
                <Flex wrap="wrap" gap="3">
                  {terms.map((term) => (
                    <label
                      key={term}
                      style={{ display: "flex", gap: 8, alignItems: "center" }}
                    >
                      <Checkbox
                        checked={selectedPreset[group].has(term)}
                        onCheckedChange={(c) =>
                          togglePresetKeyword(group, term, Boolean(c))
                        }
                      />
                      {term}
                    </label>
                  ))}
                </Flex>
              </Box>
            ))}

            <Text as="label" size="2">
              Additional keywords (comma-separated)
            </Text>
            <TextField.Root
              placeholder='e.g. "design systems", accessibility, performance'
              value={extraCsv}
              onChange={(e) =>
                setExtraCsv((e.target as HTMLInputElement).value)
              }
            />
          </Box>

          <Separator />

          {/* Google link FIRST (more accessible) */}
          <Box>
            <Text mb="2">Google link</Text>
            <TextField.Root value={googleHref} readOnly />
            <Flex justify="end" mt="3">
              <Button asChild disabled={!query}>
                <Link href={googleHref} target="_blank" rel="noreferrer">
                  Open in Google
                </Link>
              </Button>
            </Flex>
          </Box>

          {/* Preview after link */}
          <Box>
            <Text mb="2">Preview</Text>
            <TextArea value={query} readOnly minRows={4} />
            <Flex justify="end" mt="3" gap="3">
              <Button onClick={copy} disabled={!query}>
                {copied ? "Copied!" : "Copy"}
              </Button>
            </Flex>
          </Box>
        </Flex>
      </Box>
    </Theme>
  );
}
