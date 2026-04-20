'use client';

import React from 'react';
import { UploadProgress, UploadJob, UploadProgressStage } from '@/types';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui';
import { Button } from '@/components/ui/Button';
import { X, Upload, CheckCircle, AlertCircle, Loader2, Clock } from 'lucide-react';
import { getStageMessage } from '@/lib/upload-progress-sse';

interface UploadProgressBoxProps {
  progress: UploadProgress;
  onClose: () => void;
}

const JobStatusIcon: React.FC<{ status: UploadJob['status'] }> = ({ status }) => {
  switch (status) {
    case 'pending':
      return <Clock className="w-4 h-4 text-gray-400" />;
    case 'uploading':
      return <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />;
    case 'completed':
      return <CheckCircle className="w-4 h-4 text-green-500" />;
    case 'failed':
      return <AlertCircle className="w-4 h-4 text-red-500" />;
    default:
      return <div className="w-4 h-4 rounded-full border-2 border-gray-300"></div>;
  }
};

const ProgressBar: React.FC<{ progress: number; status: UploadJob['status'] }> = ({ progress, status }) => {
  const getProgressColor = () => {
    switch (status) {
      case 'completed':
        return 'bg-green-500';
      case 'failed':
        return 'bg-red-500';
      case 'uploading':
        return 'bg-blue-500';
      default:
        return 'bg-gray-300';
    }
  };

  return (
    <div className="w-full bg-gray-200 rounded-full h-1.5">
      <div
        className={`h-1.5 rounded-full transition-all duration-500 ease-out ${getProgressColor()}`}
        style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
      ></div>
    </div>
  );
};

const getJobDisplayText = (job: UploadJob): string => {
  if (job.status === 'completed') return 'Complete';
  if (job.status === 'failed') return job.error || 'Failed';
  if (job.status === 'pending') return 'Waiting...';
  
  // For uploading status, show stage message or progress
  if (job.stageMessage) {
    return job.stageMessage;
  }
  
  if (job.stage) {
    return getStageMessage(job.stage);
  }
  
  return `${Math.round(job.progress)}%`;
};

export const UploadProgressBox: React.FC<UploadProgressBoxProps> = ({
  progress,
  onClose,
}) => {
  console.log('UploadProgressBox render with progress:', progress);
  
  const getOverallProgressText = () => {
    if (progress.isAllCompleted) {
      if (progress.failedJobs > 0) {
        return `Completed: ${progress.completedJobs}/${progress.totalJobs} (${progress.failedJobs} failed)`;
      }
      return `All ${progress.completedJobs} uploads completed successfully`;
    }
    return `Uploading: ${progress.completedJobs + progress.failedJobs}/${progress.totalJobs}`;
  };

  const getOverallProgress = () => {
    return ((progress.completedJobs + progress.failedJobs) / progress.totalJobs) * 100;
  };

  const getOverallProgressBarStatus = () => {
    if (progress.isAllCompleted) {
      return progress.failedJobs > 0 ? 'failed' : 'completed';
    }
    return 'uploading';
  };

  const getJobStatusText = (job: UploadJob) => {
    if (job.status === 'completed') return '✓';
    if (job.status === 'failed') return '✗';
    if (job.status === 'uploading') return `${Math.round(job.progress)}%`;
    return 'Pending';
  };

  return (
    <div className="fixed bottom-4 right-4 w-[30%] max-w-[calc(100vw-2rem)] h-96 z-50">
      <Card className="shadow-lg border-2 border-gray-200 h-full flex flex-col">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-sm">
              <Upload className="w-4 h-4 text-blue-600" />
              Upload Progress
            </CardTitle>
            <Button
              onClick={onClose}
              disabled={!progress.isAllCompleted}
              className="h-6 w-6 p-0 bg-transparent hover:bg-gray-100 text-gray-500 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
              title={progress.isAllCompleted ? "Close" : "Cannot close until all uploads are finished"}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
          <div className="space-y-1">
            <div className="flex justify-between items-center text-xs text-gray-600">
              <span>{getOverallProgressText()}</span>
              <span>{Math.round(getOverallProgress())}%</span>
            </div>
            <ProgressBar 
              progress={getOverallProgress()} 
              status={getOverallProgressBarStatus()} 
            />
          </div>
        </CardHeader>
        <CardContent className="pt-0 flex-1 overflow-hidden">
          <div className="h-full overflow-y-auto space-y-2 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            {progress.jobs.map((job) => {
              console.log(`Rendering job ${job.id}:`, { 
                status: job.status, 
                progress: job.progress, 
                stage: job.stage, 
                stageMessage: job.stageMessage 
              });
              
              return (
                <div key={job.id} className="flex items-center gap-2 p-2 bg-gray-50 rounded text-xs">
                  <JobStatusIcon status={job.status} />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate">{job.file.name}</div>
                    <div className="flex items-center gap-2 mt-1">
                      <ProgressBar progress={job.progress} status={job.status} />
                      <span className="text-gray-500 text-xs flex-shrink-0">
                        {getJobStatusText(job)}
                      </span>
                    </div>
                    {/* Show detailed stage message */}
                    {job.status === 'uploading' && (
                      <div className="text-blue-600 text-xs mt-1">
                        {getJobDisplayText(job)}
                      </div>
                    )}
                    {job.error && (
                      <div className="text-red-500 text-xs mt-1 truncate" title={job.error}>
                        Error: {job.error}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};