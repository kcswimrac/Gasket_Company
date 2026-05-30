export async function scanFile(file: Blob, fileName: string): Promise<{
  safe: boolean;
  skipped: boolean;
  reason?: string;
}> {
  const apiKey = process.env.VIRUSTOTAL_API_KEY;
  if (!apiKey) return { safe: true, skipped: true, reason: "VIRUSTOTAL_API_KEY not configured" };

  // Only scan files under 32MB (VirusTotal free tier limit)
  if (file.size > 32 * 1024 * 1024) return { safe: true, skipped: true, reason: "File too large for scanning" };

  try {
    // Upload file to VirusTotal
    const formData = new FormData();
    formData.append("file", file, fileName);

    const uploadRes = await fetch("https://www.virustotal.com/api/v3/files", {
      method: "POST",
      headers: { "x-apikey": apiKey },
      body: formData,
    });

    if (!uploadRes.ok) return { safe: true, skipped: true, reason: `VirusTotal upload failed: ${uploadRes.status}` };

    const uploadData = await uploadRes.json();
    const analysisId = uploadData.data?.id;
    if (!analysisId) return { safe: true, skipped: true, reason: "No analysis ID returned" };

    // Poll for result (max 60 seconds)
    const deadline = Date.now() + 60_000;
    while (Date.now() < deadline) {
      await new Promise((r) => setTimeout(r, 5000));

      const pollRes = await fetch(`https://www.virustotal.com/api/v3/analyses/${analysisId}`, {
        headers: { "x-apikey": apiKey },
      });

      if (!pollRes.ok) continue;
      const pollData = await pollRes.json();

      if (pollData.data?.attributes?.status === "completed") {
        const stats = pollData.data.attributes.stats;
        const malicious = (stats.malicious || 0) + (stats.suspicious || 0);
        return { safe: malicious === 0, skipped: false, reason: malicious > 0 ? `${malicious} engines flagged this file` : undefined };
      }
    }

    return { safe: true, skipped: true, reason: "Scan timed out" };
  } catch (e) {
    return { safe: true, skipped: true, reason: e instanceof Error ? e.message : "Scan failed" };
  }
}
