'use client';

import { useState } from 'react';
import type { ReactNode } from 'react';
import { useRouter } from 'next/navigation';

import { deleteUser } from '@/app/actions/users';
import { toast } from '@/stores/ui-store';
import { Button } from '@/components/ui/button';
import { ConfirmDialog } from '@/components/ui/dialog';

/**
 * Hapus pengguna, dengan konfirmasi yang menyebut alamatnya.
 *
 * Menyebut alamat di dalam dialog, bukan cuma "Hapus pengguna ini?", karena
 * daftar pengguna adalah tabel baris seragam dan salah klik satu baris tidak
 * terlihat sampai orangnya tidak bisa masuk lagi.
 *
 * Penolakan yang sebenarnya — menghapus diri sendiri, atau menghapus `dev`
 * aktif terakhir — dijawab server; komponen ini hanya menampilkan pesannya.
 */
export function DeleteUser({ id, email }: { id: string; email: string }): ReactNode {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);

  async function onConfirm(): Promise<void> {
    setPending(true);
    const result = await deleteUser(id);
    setPending(false);
    setOpen(false);

    if (!result.ok) {
      toast.error('Tidak bisa dihapus', result.message ?? 'Coba lagi.');
      return;
    }
    toast.success('Pengguna dihapus', email);
    router.refresh();
  }

  return (
    <>
      <Button variant="danger" size="sm" onClick={() => setOpen(true)}>
        Hapus
      </Button>
      <ConfirmDialog
        open={open}
        onOpenChange={setOpen}
        title="Hapus pengguna"
        description={`${email} akan kehilangan akses ke panel. Tindakan ini tidak bisa dibatalkan.`}
        confirmLabel="Hapus"
        cancelLabel="Batal"
        loading={pending}
        onConfirm={() => void onConfirm()}
      />
    </>
  );
}
