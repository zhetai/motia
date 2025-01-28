'use client';

import type { ReactNode } from 'react';

interface ObjectType {
  /**
   * Additional description of the field
   */
  description?: ReactNode;
  type: string;
}

export function DescriptionTable({ type }: { type: Record<string, ObjectType> }) {
  return (
    <div className="prose my-6 overflow-hidden prose-no-margin">
      <table className="whitespace-nowrap text-sm text-fd-muted-foreground table-fixed">
        <thead>
          <tr>
            <th className="w-[20%]">Prop</th>
            <th className="w-[20%]">Type</th>
            <th className="w-[60%]">Description</th>
          </tr>
        </thead>
        <tbody>
          {Object.entries(type).map(([key, value]) => (
            <tr key={key}>
              <td>
                <div className="'inline-flex flex-row items-center gap-1'">
                  <label className="p-1 text-fd-primary font-bold">{key}</label>
                </div>
              </td>
              <td>
                <div className="'inline-flex flex-row items-center gap-1'">
                  <code className="rounded-md bg-fd-secondary p-1 text-fd-secondary-foreground">{value.type}</code>
                </div>
              </td>
              <td>
                <p className="p-1 m-0 text-fd-secondary-foreground break-words whitespace-break-spaces">{value.description ?? ''}</p>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}