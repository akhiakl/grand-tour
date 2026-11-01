/** One recorded `Sentry.startSpan` call: its options plus attributes set later. */
export interface RecordedSpan {
  name: string;
  op?: string;
  attributes: Record<string, unknown>;
}

/**
 * A pass-through stand-in for `Sentry.startSpan` that records every span,
 * so tests can assert names and the exact attribute keys sent.
 */
export function makeSpanRecorder() {
  const spans: RecordedSpan[] = [];
  const startSpan = <T>(
    options: { name: string; op?: string; attributes?: Record<string, unknown> },
    callback: (span: { setAttribute: (key: string, value: unknown) => void }) => T,
  ): T => {
    const span: RecordedSpan = {
      name: options.name,
      op: options.op,
      attributes: { ...options.attributes },
    };
    spans.push(span);
    return callback({
      setAttribute: (key, value) => (span.attributes[key] = value),
    });
  };
  return { spans, startSpan };
}
