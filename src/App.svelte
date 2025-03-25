<script>
  let rawLog = '';
  let parsed = [];
  let summary = '';

  function parseLog(log) {
    const lines = log.split(/\n|\r\n?/).filter(l => l.trim() !== '');
    const innings = [];
    let currentInning = null;

    for (let line of lines) {
      const inningHeader = line.match(/^(TOP|BOTTOM) OF THE (\d+)(TH|ND|RD|ST)/i);
      if (inningHeader) {
        currentInning = {
          side: inningHeader[1].toUpperCase(),
          number: inningHeader[2],
          plays: []
        };
        innings.push(currentInning);
      } else if (currentInning) {
        currentInning.plays.push(line);
      }
    }

    parsed = innings;
    generateSummary();
  }

  function generateSummary() {
    summary = parsed.map(inn => {
      let runs = inn.plays.filter(p => p.match(/scores|home run|double|triple|walk/i)).length;
      let highlights = inn.plays.filter(p => p.match(/home run|triple|double|scores/i));
      return `### ${inn.side} ${inn.number}
Plays: ${inn.plays.length} | Notable: ${highlights.length} | Run-like Events: ${runs}
- ` + highlights.join('\n- ');
    }).join('\n\n');
  }
</script>

<main>
  <h1>📝 OOTP Game Log Parser</h1>
  <textarea bind:value={rawLog} rows="20" cols="100" placeholder="Paste OOTP game log here..."></textarea>
  <br />
  <button on:click={() => parseLog(rawLog)}>Parse Log</button>

  {#if parsed.length > 0}
    <h2>Parsed Innings</h2>
    <ul>
      {#each parsed as inn}
        <li><strong>{inn.side} {inn.number}</strong>: {inn.plays.length} plays</li>
      {/each}
    </ul>

    <h2>Markdown Summary</h2>
    <pre>{summary}</pre>
  {/if}
</main>

<style>
  main {
    padding: 2rem;
    max-width: 1000px;
    margin: auto;
  }
  textarea {
    width: 100%;
    font-family: monospace;
    font-size: 1rem;
    padding: 0.5rem;
  }
  button {
    margin-top: 0.5rem;
    padding: 0.5rem 1rem;
    font-size: 1rem;
    cursor: pointer;
  }
  pre {
    background: #f4f4f4;
    padding: 1rem;
    overflow-x: auto;
  }
</style>
