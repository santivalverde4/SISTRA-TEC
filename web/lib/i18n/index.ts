import es from './es';

export type TKey = {
  [NS in keyof typeof es]: `${NS & string}.${keyof (typeof es)[NS] & string}`;
}[keyof typeof es];

/**
 * Translates a namespaced key. Falls back to the key string if not found.
 */
export function t(key: TKey): string {
  const [ns, ...rest] = key.split('.') as [keyof typeof es, string];
  const section = es[ns] as Record<string, string> | undefined;
  return section?.[rest.join('.')] ?? key;
}
