import { DocumentNode } from "graphql";
import { DataProxy } from "apollo-cache";

/**
 * converts `aString` to `A_STRING`
 * @param string
 */
export function toMacroCase(string: string) {
  return string
    .split("")
    .map(c => (c.toUpperCase() === c ? `_${c.trim()}` : c))
    .join("")
    .replace(/_+/g, "_")
    .toUpperCase();
}

export function updateApolloCache<T>(
  store: DataProxy,
  {
    query,
    getNewData,
    variables = {}
  }: { query: DocumentNode; getNewData: (d: T) => T; variables: any }
) {
  try {
    const existingData = store.readQuery<T>({
      query,
      variables
    });

    if (!existingData) {
      return null;
    }

    const newData = getNewData(existingData);

    store.writeQuery({
      query,
      variables,
      data: { ...existingData, ...newData }
    });
  } catch (_) {
    console.info(`Cache miss, skipping update.`);
  }
}