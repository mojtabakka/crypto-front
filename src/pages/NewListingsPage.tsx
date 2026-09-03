import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useI18n } from '../i18n';
import { Button } from '../components/Button';
import { Loading } from '../components/Loading';
import './NewListingsPage.css';

interface NewListing {
  id: number;
  symbol: string;
  exchange: string;
  name: string | null;
  listedDate: number;
  status: 'NEW' | 'UPCOMING' | 'TRADING';
  announcementUrl: string | null;
  description: string | null;
  createdAt: string;
}

interface ListingsResponse {
  data: NewListing[];
  total: number;
  page: number;
  totalPages: number;
}

export function NewListingsPage() {
  const { t, isRTL } = useI18n();
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string>('UPCOMING');

  const { data, isLoading, isError, refetch } = useQuery<ListingsResponse>({
    queryKey: ['new-listings', page, statusFilter],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: String(page),
        limit: '20',
      });
      if (statusFilter) {
        params.set('status', statusFilter);
      }
      const res = await fetch(`http://localhost:3000/new-listings?${params}`);
      if (!res.ok) throw new Error('Failed to fetch new listings');
      return res.json();
    },
    staleTime: 300000,
  });

  const handleFetch = async () => {
    const res = await fetch('http://localhost:3000/new-listings/fetch');
    if (res.ok) {
      refetch();
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'NEW':
        return '#22c55e';
      case 'UPCOMING':
        return '#f59e0b';
      case 'TRADING':
        return '#3b82f6';
      default:
        return '#94a3b8';
    }
  };

  const getStatusLabel = (status: string) => {
    if (!isRTL) return status;
    switch (status) {
      case 'NEW':
        return 'جدید';
      case 'UPCOMING':
        return 'به زودی';
      case 'TRADING':
        return 'در معامله';
      default:
        return status;
    }
  };

  const formatDate = (timestamp: number | string) => {
    const ts = typeof timestamp === 'string' ? parseInt(timestamp, 10) : timestamp;
    if (isRTL) {
      const date = new Date(ts);
      return isNaN(date.getTime()) ? 'نامشخص' : date.toLocaleDateString('fa-IR');
    }
    const date = new Date(ts);
    return isNaN(date.getTime()) ? 'Unknown' : date.toLocaleDateString();
  };

  return (
    <div className="new-listings-page">
      <div className="new-listings-header">
        <h1 className="new-listings-title">
          {isRTL ? '🆕 ارزهای لیست شده' : '🆕 New Listings'}
        </h1>
        <div className="new-listings-controls">
          <div className="status-filters">
            {['', 'NEW', 'UPCOMING', 'TRADING'].map((status) => (
              <button
                key={status}
                className={`filter-btn ${statusFilter === status ? 'active' : ''}`}
                onClick={() => {
                  setStatusFilter(status);
                  setPage(1);
                }}
              >
                {status ? getStatusLabel(status) : isRTL ? 'همه' : 'All'}
              </button>
            ))}
          </div>
          <Button
            variant="purple"
            size="sm"
            onClick={handleFetch}
          >
            {isRTL ? '🔄 بروزرسانی' : '🔄 Refresh'}
          </Button>
        </div>
      </div>

      {isLoading && <Loading isRTL={isRTL} />}

      {isError && (
        <div className="error-state">
          <span>⚠️</span>
          <span>{isRTL ? 'خطا در بارگذاری' : 'Failed to load'}</span>
        </div>
      )}

      {data && data.data.length === 0 && (
        <p className="placeholder-text">
          {isRTL ? 'موردی یافت نشد' : 'No listings found'}
        </p>
      )}

      {data && data.data.length > 0 && (
        <>
          <div className="new-listings-stats">
            <span>
              {isRTL ? `مجموع: ${data.total}` : `Total: ${data.total}`}
            </span>
            <span>
              {isRTL
                ? `صفحه ${data.page} از ${data.totalPages}`
                : `Page ${data.page} of ${data.totalPages}`}
            </span>
          </div>

          <div className="new-listings-grid">
            {data.data.map((listing) => (
              <div key={listing.id} className="listing-card">
                <div className="listing-card-header">
                  <span className="listing-symbol">{listing.symbol}</span>
                  <span
                    className="listing-status"
                    style={{ color: getStatusColor(listing.status) }}
                  >
                    {getStatusLabel(listing.status)}
                  </span>
                </div>
                <div className="listing-card-body">
                  <div className="listing-info">
                    <span className="listing-label">
                      {isRTL ? 'صرافی:' : 'Exchange:'}
                    </span>
                    <span className="listing-value">{listing.exchange}</span>
                  </div>
                  <div className="listing-info">
                    <span className="listing-label">
                      {isRTL ? 'تاریخ:' : 'Date:'}
                    </span>
                    <span className="listing-value">
                      {formatDate(listing.listedDate)}
                    </span>
                  </div>
                  {listing.description && (
                    <p className="listing-description">
                      {listing.description.length > 100
                        ? `${listing.description.slice(0, 100)}...`
                        : listing.description}
                    </p>
                  )}
                </div>
                {listing.announcementUrl && (
                  <a
                    href={listing.announcementUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="listing-link"
                  >
                    {isRTL ? 'مشاهده اعلامیه →' : 'View Announcement →'}
                  </a>
                )}
              </div>
            ))}
          </div>

          <div className="pagination">
            <Button
              variant="purple"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
            >
              {isRTL ? '→ قبلی' : '← Previous'}
            </Button>
            <Button
              variant="purple"
              size="sm"
              disabled={page >= data.totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              {isRTL ? 'بعدی ←' : 'Next →'}
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
