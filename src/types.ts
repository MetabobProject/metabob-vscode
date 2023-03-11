interface ApiResponse {
  jobId: string;
  status: string;
  results?: {
    id: string;
    path: string;
    startLine: number;
    endLine: number;
    category: string;
    summary: string;
    description: string;
  }[];
}
