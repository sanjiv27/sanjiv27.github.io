import { mkdir, writeFile } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';

export async function fetchActivity(token, request = fetch) {
  if (!token) throw new Error('Missing GitHub activity credential.');
  const response = await request('https://api.github.com/graphql', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({
      query: 'query($login: String!) { user(login: $login) { contributionsCollection { contributionCalendar { weeks { contributionDays { date contributionCount color } } } } } }',
      variables: { login: 'sanjiv27' },
    }),
    signal: AbortSignal.timeout(30000),
  });
  if (!response.ok) throw new Error(`GitHub activity request failed (${response.status}).`);
  const data = await response.json();
  const weeks = data.data?.user?.contributionsCollection?.contributionCalendar?.weeks;
  if (data.errors || !Array.isArray(weeks)) throw new Error('GitHub activity response is unavailable.');
  const days = weeks.flatMap(week => week.contributionDays).map(day => {
    if (!day || !/^\d{4}-\d{2}-\d{2}$/.test(day.date) ||
        !Number.isInteger(day.contributionCount) || day.contributionCount < 0 ||
        !/^#[0-9a-f]{6}$/i.test(day.color)) {
      throw new Error('Invalid GitHub activity day.');
    }
    return { date: day.date, contributionCount: day.contributionCount, color: day.color };
  });
  return { username: 'sanjiv27', days };
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    const activity = await fetchActivity(process.env.GITHUB_CONTRIBUTIONS_TOKEN);
    await mkdir('public', { recursive: true });
    await writeFile('public/github-contributions.json', JSON.stringify(activity));
    console.log(`Saved ${activity.days.length} days of GitHub activity.`);
  } catch {
    // Never print remote bodies or credentials to workflow logs.
    console.error('Unable to fetch GitHub activity; check the deployment credential and API availability.');
    process.exitCode = 1;
  }
}
