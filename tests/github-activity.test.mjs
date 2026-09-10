import { test } from 'node:test';
import assert from 'node:assert/strict';
import { fetchActivity } from '../scripts/fetch-github-contributions.mjs';

test('publishes only selected activity fields, never credentials or response extras', async () => {
  const token = 'test-only-secret';
  const day = { date: '2026-09-10', contributionCount: 2, color: '#40c463', extra: token };
  const result = await fetchActivity(token, async (_url, options) => {
    assert.equal(options.headers.Authorization, `Bearer ${token}`);
    return { ok: true, json: async () => ({ data: { user: { contributionsCollection: { contributionCalendar: { weeks: [{ contributionDays: [day] }] } } } } }) };
  });
  assert.deepEqual(result, { username: 'sanjiv27', days: [{ date: day.date, contributionCount: 2, color: '#40c463' }] });
  assert.ok(!JSON.stringify(result).includes(token));
});

test('rejects missing credentials and HTTP/GraphQL failures without echoing response bodies', async () => {
  await assert.rejects(fetchActivity(''), /Missing/);
  await assert.rejects(fetchActivity('test', async () => ({ ok: false, status: 401 })), /401/);
  await assert.rejects(fetchActivity('test', async () => ({ ok: true, json: async () => ({ errors: [{ message: 'sensitive remote detail' }] }) })), /response is unavailable/);
});
