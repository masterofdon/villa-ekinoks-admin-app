'use client';

import React from 'react';
import { UploadProgress, UploadJob, UploadProgressStage } from '@/types';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui';
import { Button } from '@/components/ui/Button';
import { X, Upload, CheckCircle, AlertCircle, Loader2, Clock } from 'lucide-react';
import { getStageMessage } from '@/lib/upload-progress-sse';
import styles from './UploadProgressBox.module.css';

interface UploadProgressBoxProps {
  progress: UploadProgress;
  onClose: () => void;
}

const JobStatusIcon: React.FC<{ status: UploadJob['status'] }> = ({ status }) => {
  switch (status) {
    case 'pending':
      return <Clock className={styles.clock} />;
    case 'uploading':
      return <Loader2 className={styles.loader2} />;
    case 'completed':
      return <CheckCircle className={styles.checkCircle} />;
    case 'failed':
      return <AlertCircle className={styles.alertCircle} />;
    default:
      return <div className={styles.div}></div>;
  }
};

const ProgressBar: React.FC<{ progress: number; status: UploadJob['status'] }> = ({ progress, status }) => {
  const getProgressColor = () => {
    switch (status) {
      case 'completed':
        return styles.cls;
      case 'failed':
        return styles.cls2;
      case 'uploading':
        return styles.cls3;
      default:
        return styles.cls4;
    }
  };

  return (
    <div className={styles.div2}>
      <div
        className={`${styles.div3} ${getProgressColor()}`}
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
    <div className={styles.div4}>
      <Card className={styles.card}>
        <CardHeader className={styles.cardHeader}>
          <div className={styles.div5}>
            <CardTitle className={styles.cardTitle}>
              <Upload className={styles.upload} />
              Upload Progress
            </CardTitle>
            <Button
              onClick={onClose}
              disabled={!progress.isAllCompleted}
              className={styles.button}
              title={progress.isAllCompleted ? "Close" : "Cannot close until all uploads are finished"}
            >
              <X className={styles.x} />
            </Button>
          </div>
          <div className={styles.div6}>
            <div className={styles.div7}>
              <span>{getOverallProgressText()}</span>
              <span>{Math.round(getOverallProgress())}%</span>
            </div>
            <ProgressBar 
              progress={getOverallProgress()} 
              status={getOverallProgressBarStatus()} 
            />
          </div>
        </CardHeader>
        <CardContent className={styles.cardContent}>
          <div className={styles.div8}>
            {progress.jobs.map((job) => {
              console.log(`Rendering job ${job.id}:`, { 
                status: job.status, 
                progress: job.progress, 
                stage: job.stage, 
                stageMessage: job.stageMessage 
              });
              
              return (
                <div key={job.id} className={styles.div9}>
                  <JobStatusIcon status={job.status} />
                  <div className={styles.div10}>
                    <div className={styles.div11}>{job.file.name}</div>
                    <div className={styles.div12}>
                      <ProgressBar progress={job.progress} status={job.status} />
                      <span className={styles.span}>
                        {getJobStatusText(job)}
                      </span>
                    </div>
                    {/* Show detailed stage message */}
                    {job.status === 'uploading' && (
                      <div className={styles.div13}>
                        {getJobDisplayText(job)}
                      </div>
                    )}
                    {job.error && (
                      <div className={styles.div14} title={job.error}>
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