'use client';

import React, { useState } from 'react';
import { useCreateManualBooking, useServicableItems } from '@/hooks/api';
import {
  Create_VillaBookingManual_WC_MLS_XAction,
  Create_VillaBookingAdditionalService_WC_MLS_XAction,
} from '@/types';
import { Card, CardHeader, CardTitle, CardContent, Input, Label } from '@/components/ui';
import { Button } from '@/components/ui/Button';
import { X, Plus, Trash2 } from 'lucide-react';
import { htmlDateToYYYYMMDD } from '@/lib/date-utils';
import styles from './CreateManualBookingModal.module.css';

interface CreateManualBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

type AdditionalServiceRow = {
  id: string;
  servicableitemid: string;
  quantity: number;
};

export const CreateManualBookingModal: React.FC<CreateManualBookingModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [formData, setFormData] = useState({
    inquiroremail: '',
    inquirorname: '',
    inquirorlastname: '',
    inquirorlocale: 'en_GB',
    inquirorcurrency: 'EUR',
    startdate: '',
    enddate: '',
    numberofguests: 1,
    numberofchildren: 0,
    totalamount: '',
    totalamountcurrency: 'EUR',
  });

  const [additionalServices, setAdditionalServices] = useState<AdditionalServiceRow[]>([]);
  const [nextServiceId, setNextServiceId] = useState(0);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const createManualBookingMutation = useCreateManualBooking();
  const { data: servicableItemsData } = useServicableItems(0, 100);

  const activeServiceItems = servicableItemsData?.content.filter(
    (item) => item.status === 'ACTIVE'
  ) ?? [];

  const validateGuestFields = (newErrors: Record<string, string>) => {
    if (!formData.inquiroremail.trim()) {
      newErrors.inquiroremail = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.inquiroremail)) {
      newErrors.inquiroremail = 'Invalid email address';
    }
    if (!formData.inquirorname.trim()) {
      newErrors.inquirorname = 'First name is required';
    }
    if (!formData.inquirorlastname.trim()) {
      newErrors.inquirorlastname = 'Last name is required';
    }
  };

  const validateBookingFields = (newErrors: Record<string, string>) => {
    if (!formData.startdate) {
      newErrors.startdate = 'Check-in date is required';
    }
    if (!formData.enddate) {
      newErrors.enddate = 'Check-out date is required';
    } else if (formData.startdate && formData.enddate <= formData.startdate) {
      newErrors.enddate = 'Check-out must be after check-in';
    }
    if (formData.numberofguests < 1) {
      newErrors.numberofguests = 'At least 1 guest is required';
    }
    if (formData.numberofchildren < 0) {
      newErrors.numberofchildren = 'Cannot be negative';
    }
  };

  const validatePaymentFields = (newErrors: Record<string, string>) => {
    if (formData.totalamount.trim()) {
      const amount = Number.parseFloat(formData.totalamount);
      if (Number.isNaN(amount) || amount < 0) {
        newErrors.totalamount = 'Must be a valid non-negative number';
      }
    } else {
      newErrors.totalamount = 'Total amount is required';
    }
    if (!formData.totalamountcurrency.trim()) {
      newErrors.totalamountcurrency = 'Currency is required';
    }
  };

  const validateServiceRows = (newErrors: Record<string, string>) => {
    additionalServices.forEach((svc, index) => {
      if (!svc.servicableitemid) {
        newErrors[`service_${index}_item`] = 'Please select an item';
      }
      if (svc.quantity < 1) {
        newErrors[`service_${index}_qty`] = 'Quantity must be at least 1';
      }
    });
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    validateGuestFields(newErrors);
    validateBookingFields(newErrors);
    validatePaymentFields(newErrors);
    validateServiceRows(newErrors);
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      const services: Create_VillaBookingAdditionalService_WC_MLS_XAction[] = additionalServices.map(
        (svc) => ({ servicableitemid: svc.servicableitemid, quantity: svc.quantity })
      );

      const bookingData: Omit<Create_VillaBookingManual_WC_MLS_XAction, 'villaid'> = {
        inquiroremail: formData.inquiroremail.trim(),
        inquirorname: formData.inquirorname.trim(),
        inquirorlastname: formData.inquirorlastname.trim(),
        inquirorlocale: formData.inquirorlocale.trim(),
        inquirorcurrency: formData.inquirorcurrency.trim().toUpperCase(),
        startdate: htmlDateToYYYYMMDD(formData.startdate),
        enddate: htmlDateToYYYYMMDD(formData.enddate),
        numberofguests: formData.numberofguests,
        numberofchildren: formData.numberofchildren,
        totalamount: formData.totalamount.trim(),
        totalamountcurrency: formData.totalamountcurrency.trim().toUpperCase(),
        additionalservices: services,
      };

      await createManualBookingMutation.mutateAsync(bookingData);

      // Reset form
      setFormData({
        inquiroremail: '',
        inquirorname: '',
        inquirorlastname: '',
        inquirorlocale: 'en_GB',
        inquirorcurrency: 'EUR',
        startdate: '',
        enddate: '',
        numberofguests: 1,
        numberofchildren: 0,
        totalamount: '',
        totalamountcurrency: 'EUR',
      });
      setAdditionalServices([]);
      setErrors({});

      onSuccess();
    } catch (error) {
      console.error('Failed to create manual booking:', error);
      setErrors({
        submit: error instanceof Error ? error.message : 'Failed to create booking',
      });
    }
  };

  const handleChange = (field: string, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const addServiceRow = () => {
    setAdditionalServices((prev) => [...prev, { id: String(nextServiceId), servicableitemid: '', quantity: 1 }]);
    setNextServiceId((prev) => prev + 1);
  };

  const removeServiceRow = (index: number) => {
    setAdditionalServices((prev) => prev.filter((_, i) => i !== index));
    setErrors((prev) => {
      const next = { ...prev };
      delete next[`service_${index}_item`];
      delete next[`service_${index}_qty`];
      return next;
    });
  };

  const updateServiceRow = (index: number, field: keyof Omit<AdditionalServiceRow, 'id'>, value: string | number) => {
    setAdditionalServices((prev) =>
      prev.map((svc, i) => (i === index ? { ...svc, [field]: value } : svc))
    );
    setErrors((prev) => ({ ...prev, [`service_${index}_${field === 'servicableitemid' ? 'item' : 'qty'}`]: '' }));
  };

  if (!isOpen) return null;

  return (
    <div className={styles.div}>
      <div className={styles.div2}>
        <Card className={styles.card}>
          <CardHeader className={styles.cardHeader}>
            <CardTitle className={styles.cardTitle}>Create Manual Booking</CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={onClose}
              className={styles.button}
            >
              <X className={styles.x} />
            </Button>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className={styles.form}>
              {/* Guest Information */}
              <div>
                <h3 className={styles.h3}>Guest Information</h3>
                <div className={styles.div3}>
                  <div>
                    <Label htmlFor="inquirorname">First Name</Label>
                    <Input
                      id="inquirorname"
                      type="text"
                      value={formData.inquirorname}
                      onChange={(e) => handleChange('inquirorname', e.target.value)}
                      placeholder="John"
                      className={styles.input}
                    />
                    {errors.inquirorname && (
                      <p className={styles.p}>{errors.inquirorname}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="inquirorlastname">Last Name</Label>
                    <Input
                      id="inquirorlastname"
                      type="text"
                      value={formData.inquirorlastname}
                      onChange={(e) => handleChange('inquirorlastname', e.target.value)}
                      placeholder="Doe"
                      className={styles.input}
                    />
                    {errors.inquirorlastname && (
                      <p className={styles.p}>{errors.inquirorlastname}</p>
                    )}
                  </div>

                  <div className={styles.div4}>
                    <Label htmlFor="inquiroremail">Email</Label>
                    <Input
                      id="inquiroremail"
                      type="email"
                      value={formData.inquiroremail}
                      onChange={(e) => handleChange('inquiroremail', e.target.value)}
                      placeholder="guest@example.com"
                      className={styles.input}
                    />
                    {errors.inquiroremail && (
                      <p className={styles.p}>{errors.inquiroremail}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="inquirorlocale">Locale</Label>
                    <select
                      id="inquirorlocale"
                      value={formData.inquirorlocale}
                      onChange={(e) => handleChange('inquirorlocale', e.target.value)}
                      className={styles.select}
                    >
                      <option value="en_GB">en_GB</option>
                      <option value="en_US">en_US</option>
                      <option value="tr_TR">tr_TR</option>
                      <option value="de_DE">de_DE</option>
                      <option value="fr_FR">fr_FR</option>
                      <option value="ar_SA">ar_SA</option>
                      <option value="it_IT">it_IT</option>
                      <option value="nl_NL">nl_NL</option>
                      <option value="es_ES">es_ES</option>
                      <option value="ru_RU">ru_RU</option>
                    </select>
                  </div>

                  <div>
                    <Label htmlFor="inquirorcurrency">Guest Currency</Label>
                    <select
                      id="inquirorcurrency"
                      value={formData.inquirorcurrency}
                      onChange={(e) => handleChange('inquirorcurrency', e.target.value)}
                      className={styles.select}
                    >
                      <option value="EUR">EUR</option>
                      <option value="USD">USD</option>
                      <option value="TRY">TRY</option>
                      <option value="GBP">GBP</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Booking Dates & Guests */}
              <div>
                <h3 className={styles.h3}>Booking Details</h3>
                <div className={styles.div3}>
                  <div>
                    <Label htmlFor="startdate">Check-in Date</Label>
                    <Input
                      id="startdate"
                      type="date"
                      value={formData.startdate}
                      onChange={(e) => handleChange('startdate', e.target.value)}
                      className={styles.input}
                    />
                    {errors.startdate && (
                      <p className={styles.p}>{errors.startdate}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="enddate">Check-out Date</Label>
                    <Input
                      id="enddate"
                      type="date"
                      value={formData.enddate}
                      onChange={(e) => handleChange('enddate', e.target.value)}
                      className={styles.input}
                    />
                    {errors.enddate && (
                      <p className={styles.p}>{errors.enddate}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="numberofguests">Number of Adults</Label>
                    <Input
                      id="numberofguests"
                      type="number"
                      min={1}
                      value={formData.numberofguests}
                      onChange={(e) => handleChange('numberofguests', Number.parseInt(e.target.value, 10) || 1)}
                      className={styles.input}
                    />
                    {errors.numberofguests && (
                      <p className={styles.p}>{errors.numberofguests}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="numberofchildren">Number of Children</Label>
                    <Input
                      id="numberofchildren"
                      type="number"
                      min={0}
                      value={formData.numberofchildren}
                      onChange={(e) => handleChange('numberofchildren', Number.parseInt(e.target.value, 10) || 0)}
                      className={styles.input}
                    />
                    {errors.numberofchildren && (
                      <p className={styles.p}>{errors.numberofchildren}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Payment */}
              <div>
                <h3 className={styles.h3}>Payment</h3>
                <div className={styles.div3}>
                  <div>
                    <Label htmlFor="totalamount">Total Amount</Label>
                    <Input
                      id="totalamount"
                      type="text"
                      inputMode="decimal"
                      value={formData.totalamount}
                      onChange={(e) => handleChange('totalamount', e.target.value.replace(/,/g, '.'))}
                      placeholder="0.00"
                      className={styles.input}
                    />
                    {errors.totalamount && (
                      <p className={styles.p}>{errors.totalamount}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="totalamountcurrency">Currency</Label>
                    <select
                      id="totalamountcurrency"
                      value={formData.totalamountcurrency}
                      onChange={(e) => handleChange('totalamountcurrency', e.target.value)}
                      className={styles.select}
                    >
                      <option value="EUR">EUR</option>
                      <option value="USD">USD</option>
                      <option value="TRY">TRY</option>
                      <option value="GBP">GBP</option>
                    </select>
                    {errors.totalamountcurrency && (
                      <p className={styles.p}>{errors.totalamountcurrency}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Additional Services */}
              {activeServiceItems.length > 0 && (
                <div>
                  <div className={styles.div5}>
                    <h3 className={styles.h32}>Additional Services</h3>
                    <button
                      type="button"
                      onClick={addServiceRow}
                      className={styles.button2}
                    >
                      <Plus className={styles.x} />
                      Add Service
                    </button>
                  </div>

                  {additionalServices.length === 0 ? (
                    <p className={styles.p2}>No additional services added.</p>
                  ) : (
                    <div className={styles.div6}>
                      {additionalServices.map((svc, index) => (
                        <div key={svc.id} className={styles.div7}>
                          <div className={styles.div8}>
                            <select
                              value={svc.servicableitemid}
                              onChange={(e) => updateServiceRow(index, 'servicableitemid', e.target.value)}
                              className={styles.select2}
                            >
                              <option value="">Select service...</option>
                              {activeServiceItems.map((item) => (
                                <option key={item.id} value={item.id}>
                                  {item.name} ({item.price.amount} {item.price.currency} / {item.unit})
                                </option>
                              ))}
                            </select>
                            {errors[`service_${index}_item`] && (
                              <p className={styles.p}>{errors[`service_${index}_item`]}</p>
                            )}
                          </div>
                          <div className={styles.div9}>
                            <Input
                              type="number"
                              min={1}
                              value={svc.quantity}
                              onChange={(e) => updateServiceRow(index, 'quantity', Number.parseInt(e.target.value, 10) || 1)}
                              placeholder="Qty"
                            />
                            {errors[`service_${index}_qty`] && (
                              <p className={styles.p}>{errors[`service_${index}_qty`]}</p>
                            )}
                          </div>
                          <button
                            type="button"
                            onClick={() => removeServiceRow(index)}
                            className={styles.button3}
                          >
                            <Trash2 className={styles.x} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {errors.submit && (
                <div className={styles.div10}>
                  <p className={styles.p3}>{errors.submit}</p>
                </div>
              )}

              <div className={styles.div11}>
                <Button
                  type="submit"
                  disabled={createManualBookingMutation.isPending}
                  className={styles.div8}
                >
                  {createManualBookingMutation.isPending ? 'Creating...' : 'Create Booking'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  disabled={createManualBookingMutation.isPending}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
