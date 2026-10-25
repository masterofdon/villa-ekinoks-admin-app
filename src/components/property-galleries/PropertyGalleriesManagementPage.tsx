'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { usePropertyGalleries, useReorderPropertyGalleries, useDeletePropertyGallery } from '@/hooks/api';
import { PropertyGallery } from '@/types';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui';
import { Button } from '@/components/ui/Button';
import { Plus, Images, AlertTriangle, ChevronRight, ImageIcon, GripVertical, Save, Trash2 } from 'lucide-react';
import { CreatePropertyGalleryModal } from './CreatePropertyGalleryModal';
import { AuthImage } from '@/components/ui/AuthImage';
import styles from './PropertyGalleriesManagementPage.module.css';

const GalleryCard: React.FC<{
  gallery: PropertyGallery;
  onClick: () => void;
  onDelete: () => void;
  isDragging: boolean;
  isDragOver: boolean;
  onDragStart: (e: React.DragEvent) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDragLeave: () => void;
  onDrop: (e: React.DragEvent) => void;
  onDragEnd: () => void;
}> = ({ gallery, onClick, onDelete, isDragging, isDragOver, onDragStart, onDragOver, onDragLeave, onDrop, onDragEnd }) => {
  const coverImage = gallery.images?.[0]?.resizedlargefile?.url;

  return (
    <li
      draggable
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      onDragEnd={onDragEnd}
      className={`${styles.li} ${isDragging ? styles.li2 : ''}
        ${isDragOver ? styles.li3 : styles.li4}
      `}
    >
      <div className={styles.div}>
        {coverImage ? (
          <AuthImage
            url={coverImage}
            alt={gallery.name}
            className={styles.authImage}
          />
        ) : (
          <ImageIcon className={styles.imageIcon} />
        )}
        <div className={styles.div2}>
          <GripVertical className={styles.gripVertical} />
        </div>
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onDelete(); }}
          className={styles.button}
          title="Delete gallery"
        >
          <Trash2 className={styles.trash2} />
        </button>
      </div>
      <button
        type="button"
        onClick={onClick}
        className={`${styles.button2} ${styles.group}`}
      >
        <div className={styles.div3}>
          <h3 className={styles.h3}>{gallery.name}</h3>
          <p className={styles.p}>{gallery.description}</p>
          <p className={styles.p2}>
            {gallery.images?.length ?? 0} image{(gallery.images?.length ?? 0) === 1 ? '' : 's'}
          </p>
        </div>
        <ChevronRight className={styles.chevronRight} />
      </button>
    </li>
  );
};

export const PropertyGalleriesManagementPage: React.FC = () => {
  const router = useRouter();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [orderedGalleries, setOrderedGalleries] = useState<PropertyGallery[]>([]);
  const [hasOrderChanged, setHasOrderChanged] = useState(false);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);
  const originalOrderRef = useRef<string[]>([]);

  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const { data, isLoading, error, refetch } = usePropertyGalleries();
  const reorderMutation = useReorderPropertyGalleries();
  const deleteMutation = useDeletePropertyGallery();

  useEffect(() => {
    const galleries = data?.galleries ?? [];
    setOrderedGalleries(galleries);
    originalOrderRef.current = galleries.map((g) => g.id);
    setHasOrderChanged(false);
  }, [data]);

  const handleModalSuccess = () => {
    setIsCreateModalOpen(false);
    refetch();
  };

  const handleDeleteConfirm = () => {
    if (!confirmDeleteId) return;
    deleteMutation.mutate(confirmDeleteId, {
      onSuccess: () => {
        setConfirmDeleteId(null);
      },
      onError: () => {
        setConfirmDeleteId(null);
      },
    });
  };

  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDraggingId(id);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', id);
  };

  const handleDragOver = (e: React.DragEvent, id: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (id !== draggingId) {
      setDragOverId(id);
    }
  };

  const handleDragLeave = () => {
    setDragOverId(null);
  };

  const handleDrop = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    const sourceId = e.dataTransfer.getData('text/plain');
    if (!sourceId || sourceId === targetId) {
      setDragOverId(null);
      return;
    }

    setOrderedGalleries((prev) => {
      const updated = [...prev];
      const fromIndex = updated.findIndex((g) => g.id === sourceId);
      const toIndex = updated.findIndex((g) => g.id === targetId);
      if (fromIndex === -1 || toIndex === -1) return prev;
      const [moved] = updated.splice(fromIndex, 1);
      updated.splice(toIndex, 0, moved);
      const newOrder = updated.map((g) => g.id);
      setHasOrderChanged(
        newOrder.some((id, i) => id !== originalOrderRef.current[i])
      );
      return updated;
    });

    setDragOverId(null);
  };

  const handleDragEnd = () => {
    setDraggingId(null);
    setDragOverId(null);
  };

  const handleSaveOrder = () => {
    const idordermap: { [id: string]: number } = {};
    orderedGalleries.forEach((g, index) => {
      idordermap[g.id] = index;
    });

    reorderMutation.mutate(
      { idordermap },
      {
        onSuccess: () => {
          originalOrderRef.current = orderedGalleries.map((g) => g.id);
          setHasOrderChanged(false);
        },
      }
    );
  };

  if (isLoading) {
    return (
      <div className={styles.div4}>
        <div className={styles.div5}>
          <div className={styles.div6}></div>
          <div className={styles.div7}>
            {[1, 2, 3].map((i) => (
              <div key={i} className={styles.div8}></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.div4}>
        <Card>
          <CardContent className={styles.div4}>
            <div className={styles.div9}>
              <AlertTriangle className={styles.alertTriangle} />
              <h3 className={styles.h32}>
                Error Loading Galleries
              </h3>
              <p className={styles.p3}>
                {error instanceof Error ? error.message : 'An unexpected error occurred'}
              </p>
              <Button onClick={() => refetch()}>Try Again</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className={styles.div10}>
      <div className={styles.div11}>
        <h1 className={styles.h1}>
          <Images className={styles.images} />
          Property Galleries
        </h1>
        <p className={styles.p4}>
          Manage photo galleries for your villa property
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className={styles.div12}>
            <div className={styles.div13}>
              <CardTitle>Galleries</CardTitle>
              {hasOrderChanged && (
                <Button
                  onClick={handleSaveOrder}
                  disabled={reorderMutation.isPending}
                  className={styles.button3}
                >
                  <Save className={styles.save} />
                  {reorderMutation.isPending ? 'Saving...' : 'Save gallery order'}
                </Button>
              )}
            </div>
            <Button
              onClick={() => setIsCreateModalOpen(true)}
              className={styles.button4}
            >
              <Plus className={styles.plus} />
              New Gallery
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {orderedGalleries.length === 0 ? (
            <div className={styles.div14}>
              <Images className={styles.images2} />
              <h3 className={styles.h32}>No Galleries Yet</h3>
              <p className={styles.p3}>
                Create your first gallery to start showcasing your villa.
              </p>
              <Button
                onClick={() => setIsCreateModalOpen(true)}
                className={styles.button4}
              >
                <Plus className={styles.plus} />
                Create First Gallery
              </Button>
            </div>
          ) : (
            <ol className={styles.ol}>
              {orderedGalleries.map((gallery) => (
                <GalleryCard
                  key={gallery.id}
                  gallery={gallery}
                  onClick={() => router.push(`/property-galleries/${gallery.id}`)}
                  onDelete={() => setConfirmDeleteId(gallery.id)}
                  isDragging={draggingId === gallery.id}
                  isDragOver={dragOverId === gallery.id}
                  onDragStart={(e) => handleDragStart(e, gallery.id)}
                  onDragOver={(e) => handleDragOver(e, gallery.id)}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, gallery.id)}
                  onDragEnd={handleDragEnd}
                />
              ))}
            </ol>
          )}
        </CardContent>
      </Card>

      <CreatePropertyGalleryModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={handleModalSuccess}
      />

      {confirmDeleteId && (
        <div className={styles.div15}>
          <div className={styles.div16}>
            <div className={styles.div17}>
              <AlertTriangle className={styles.alertTriangle2} />
              <div>
                <h3 className={styles.h33}>Delete Gallery</h3>
                <p className={styles.p5}>
                  Are you sure you want to delete this gallery? This action cannot be undone.
                </p>
              </div>
            </div>
            <div className={styles.div18}>
              <Button
                onClick={() => setConfirmDeleteId(null)}
                disabled={deleteMutation.isPending}
                className={styles.button5}
              >
                Cancel
              </Button>
              <Button
                onClick={handleDeleteConfirm}
                disabled={deleteMutation.isPending}
                className={styles.button6}
              >
                {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
