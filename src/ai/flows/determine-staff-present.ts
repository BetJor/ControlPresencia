'use server';

/**
 * @fileOverview Determines staff members who are currently on-site but haven't checked out.
 *
 * - determineStaffPresent - A function that identifies staff members present on-site.
 * - DetermineStaffPresentInput - The input type for the determineStaffPresent function.
 * - DetermineStaffPresentOutput - The return type for the determineStaffPresent function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const DetermineStaffPresentInputSchema = z.object({
  employeeIds: z.array(z.string()).describe('A list of employee IDs to check for presence.'),
  dailyPunchCounts: z.record(z.number()).describe('A map of employee IDs to their daily punch counts.'),
});
export type DetermineStaffPresentInput = z.infer<typeof DetermineStaffPresentInputSchema>;

const DetermineStaffPresentOutputSchema = z.object({
  presentEmployeeIds: z.array(z.string()).describe('A list of employee IDs who are currently present (odd punch count).'),
});
export type DetermineStaffPresentOutput = z.infer<typeof DetermineStaffPresentOutputSchema>;

export async function determineStaffPresent(input: DetermineStaffPresentInput): Promise<DetermineStaffPresentOutput> {
  return determineStaffPresentFlow(input);
}

const determineStaffPresentFlow = ai.defineFlow(
  {
    name: 'determineStaffPresentFlow',
    inputSchema: DetermineStaffPresentInputSchema,
    outputSchema: DetermineStaffPresentOutputSchema,
  },
  async input => {
    const presentEmployeeIds: string[] = [];

    for (const employeeId of input.employeeIds) {
      const punchCount = input.dailyPunchCounts[employeeId] || 0;
      if (punchCount % 2 !== 0) {
        presentEmployeeIds.push(employeeId);
      }
    }

    return {
      presentEmployeeIds,
    };
  }
);
