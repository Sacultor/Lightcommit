import { useQuery } from '@tanstack/react-query';
import { contributionsApi } from '@/lib/api';

export function useContributions(params?: {
  type?: string;
  status?: string;
  userId?: string;
  repositoryId?: string;
}) {
  return useQuery({
    queryKey: ['contributions', params],
    queryFn: () => contributionsApi.getAll(params),
  });
}

export function useContribution(id: string) {
  return useQuery({
    queryKey: ['contribution', id],
    queryFn: () => contributionsApi.getOne(id),
    enabled: !!id,
  });
}

export function useMyContributions() {
  return useQuery({
    queryKey: ['my-contributions'],
    queryFn: () => contributionsApi.getMy(),
  });
}

export function useContributionStats(userId?: string) {
  return useQuery({
    queryKey: ['contribution-stats', userId],
    queryFn: () => contributionsApi.getStats(userId),
  });
}

