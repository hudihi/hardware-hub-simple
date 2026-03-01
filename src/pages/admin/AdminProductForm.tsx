import React, { useState, useRef } from 'react';
import { categories } from '../../data/products';
import { useLanguage } from '../../context/LanguageContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { Label } from '../../components/ui/label';
import { RadioGroup, RadioGroupItem } from '../../components/ui/radio-group';
import { Checkbox } from '../../components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { toast } from '@/hooks/use-toast';
import { Upload, Link, ImageIcon, X } from 'lucide-react';

interface AdminProductFormProps {
  open: boolean;
  onClose: () => void;
  onProductCreated?: () => void;
}

interface FormData {
  name: string;
  description: string;
  price: string;
  category: string;
  currency: string;
  unit: string;
  stock: string;
  isActive: boolean;
  imageMode: 'upload' | 'url';
  imageUrl: string;
  imageFile: File | null;
}

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

const AdminProductForm: React.FC<AdminProductFormProps> = ({ open, onClose, onProductCreated }) => {
  const { t } = useLanguage();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});

  const [form, setForm] = useState<FormData>({
    name: '',
    description: '',
    price: '',
    category: '',
    currency: 'TZS',
    unit: 'pcs',
    stock: '0',
    isActive: true,
    imageMode: 'upload',
    imageUrl: '',
    imageFile: null,
  });

  const updateField = <K extends keyof FormData>(key: K, value: FormData[K]) => {
    setForm(prev => ({ ...prev, [key]: value }));
    if (errors[key]) setErrors(prev => ({ ...prev, [key]: undefined }));
  };

  const handleFileSelect = (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast({ title: t('system_error'), description: 'Please select an image file.', variant: 'destructive' });
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      toast({ title: t('system_error'), description: 'Image must be less than 5MB.', variant: 'destructive' });
      return;
    }
    updateField('imageFile', file);
    const reader = new FileReader();
    reader.onload = (e) => setImagePreview(e.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileSelect(file);
  };

  const clearImage = () => {
    updateField('imageFile', null);
    updateField('imageUrl', '');
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof FormData, string>> = {};
    if (!form.name.trim()) newErrors.name = t('validation_required');
    if (!form.description.trim()) newErrors.description = t('validation_required');
    if (!form.price || parseFloat(form.price) <= 0) newErrors.price = t('validation_required');
    if (!form.category) newErrors.category = t('validation_required');
    if (form.imageMode === 'url' && form.imageUrl) {
      try { new URL(form.imageUrl); } catch { newErrors.imageUrl = t('validation_email_invalid'); }
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      // Simulate API call - in production this would POST to /products
      await new Promise(resolve => setTimeout(resolve, 1000));

      toast({ title: t('system_added_to_cart').replace('cart', 'products'), description: form.name });
      resetForm();
      onProductCreated?.();
      onClose();
    } catch {
      toast({ title: t('system_error'), variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setForm({
      name: '', description: '', price: '', category: '', currency: 'TZS',
      unit: 'pcs', stock: '0', isActive: true, imageMode: 'upload', imageUrl: '', imageFile: null,
    });
    setImagePreview(null);
    setErrors({});
  };

  const currentPreview = form.imageMode === 'url' && form.imageUrl ? form.imageUrl : imagePreview;

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold">{t('admin_add_product')}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="name">{t('checkout_name').replace('Full ', '')} *</Label>
            <Input
              id="name"
              value={form.name}
              onChange={(e) => updateField('name', e.target.value)}
              placeholder={t('admin_search_products').replace('...', '')}
              className={errors.name ? 'border-destructive' : ''}
            />
            {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              value={form.description}
              onChange={(e) => updateField('description', e.target.value)}
              placeholder="Product description..."
              rows={3}
              className={errors.description ? 'border-destructive' : ''}
            />
            {errors.description && <p className="text-sm text-destructive">{errors.description}</p>}
          </div>

          {/* Price & Category row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="price">{t('admin_price')} *</Label>
              <Input
                id="price"
                type="number"
                min="0"
                step="0.01"
                value={form.price}
                onChange={(e) => updateField('price', e.target.value)}
                placeholder="0.00"
                className={errors.price ? 'border-destructive' : ''}
              />
              {errors.price && <p className="text-sm text-destructive">{errors.price}</p>}
            </div>

            <div className="space-y-2">
              <Label>{t('admin_category')} *</Label>
              <Select value={form.category} onValueChange={(v) => updateField('category', v)}>
                <SelectTrigger className={errors.category ? 'border-destructive' : ''}>
                  <SelectValue placeholder={t('admin_all_categories')} />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(cat => (
                    <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.category && <p className="text-sm text-destructive">{errors.category}</p>}
            </div>
          </div>

          {/* Currency, Unit, Stock row */}
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="currency">Currency</Label>
              <Input id="currency" value={form.currency} onChange={(e) => updateField('currency', e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="unit">Unit</Label>
              <Input id="unit" value={form.unit} onChange={(e) => updateField('unit', e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="stock">{t('admin_stock')}</Label>
              <Input id="stock" type="number" min="0" value={form.stock} onChange={(e) => updateField('stock', e.target.value)} />
            </div>
          </div>

          {/* Active checkbox */}
          <div className="flex items-center gap-2">
            <Checkbox
              id="isActive"
              checked={form.isActive}
              onCheckedChange={(checked) => updateField('isActive', !!checked)}
            />
            <Label htmlFor="isActive" className="cursor-pointer">Active</Label>
          </div>

          {/* Image section */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">Product Image</Label>

            <RadioGroup
              value={form.imageMode}
              onValueChange={(v) => { updateField('imageMode', v as 'upload' | 'url'); clearImage(); }}
              className="flex gap-6"
            >
              <div className="flex items-center gap-2">
                <RadioGroupItem value="upload" id="img-upload" />
                <Label htmlFor="img-upload" className="cursor-pointer flex items-center gap-1">
                  <Upload size={14} /> Upload Image
                </Label>
              </div>
              <div className="flex items-center gap-2">
                <RadioGroupItem value="url" id="img-url" />
                <Label htmlFor="img-url" className="cursor-pointer flex items-center gap-1">
                  <Link size={14} /> Image URL
                </Label>
              </div>
            </RadioGroup>

            {form.imageMode === 'upload' ? (
              <div
                className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer
                  ${dragActive ? 'border-primary bg-primary/5' : 'border-muted-foreground/25 hover:border-primary/50'}`}
                onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
                onDragLeave={() => setDragActive(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => { if (e.target.files?.[0]) handleFileSelect(e.target.files[0]); }}
                />
                <ImageIcon className="mx-auto mb-2 text-muted-foreground" size={32} />
                <p className="text-sm text-muted-foreground">
                  Drag & drop or click to upload
                </p>
                <p className="text-xs text-muted-foreground mt-1">Max 5MB · JPG, PNG, WEBP</p>
              </div>
            ) : (
              <div className="space-y-2">
                <Input
                  value={form.imageUrl}
                  onChange={(e) => updateField('imageUrl', e.target.value)}
                  placeholder="https://example.com/image.jpg"
                  className={errors.imageUrl ? 'border-destructive' : ''}
                />
                {errors.imageUrl && <p className="text-sm text-destructive">{errors.imageUrl}</p>}
              </div>
            )}

            {/* Image preview */}
            {currentPreview && (
              <div className="relative inline-block">
                <img
                  src={currentPreview}
                  alt="Preview"
                  className="h-32 w-32 object-cover rounded-lg border"
                  onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder.svg'; }}
                />
                <button
                  type="button"
                  onClick={clearImage}
                  className="absolute -top-2 -right-2 rounded-full bg-destructive text-destructive-foreground p-0.5"
                >
                  <X size={14} />
                </button>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? t('checkout_loading') : t('admin_add_product')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AdminProductForm;
