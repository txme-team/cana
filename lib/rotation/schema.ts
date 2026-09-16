import type { RotationEvent } from '@/lib/rotation/events';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://cana.im';

export function organizationJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: '카나',
    url: SITE_URL,
    logo: `${SITE_URL}/txme-assets/logos/logo_black.svg`,
    description: '신앙 안에서 진지한 만남을 찾는 크리스천을 위한 프리미엄 소개팅 서비스',
    sameAs: ['https://instagram.com/cana_for_love'],
  };
}

export function rotationServiceJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: '카나 로테이션 소개팅',
    serviceType: '크리스천 로테이션 소개팅 매칭 서비스',
    url: `${SITE_URL}/rotation`,
    description:
      '소개팅 전날 참가자 전원의 프로필 카드를 공유하고, 당일 1:1로 약 10분씩 대화를 나누는 사전 심사 기반 크리스천 로테이션 소개팅. 4~10명의 이성과 매칭.',
    provider: {
      '@type': 'Organization',
      name: '카나',
      url: SITE_URL,
    },
    areaServed: {
      '@type': 'Country',
      name: 'KR',
    },
    audience: {
      '@type': 'Audience',
      audienceType: '한국교회 교단에 등록된 미혼 크리스천',
    },
  };
}

export function breadcrumbJsonLd(items: { name: string; path: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: `${SITE_URL}${item.path}`,
    })),
  };
}

// 참가 신청이 로그인 뒤에 있어 정확한 도로명 주소는 공개하지 않으므로,
// Place.name에는 이미 사용자에게 보이는 지역명만 넣는다(허위 address 생성 금지).
export function rotationEventsJsonLd(events: RotationEvent[]) {
  return events.map((event) => ({
    '@context': 'https://schema.org',
    '@type': 'Event',
    name: event.title,
    startDate: event.event_date,
    eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
    eventStatus: 'https://schema.org/EventScheduled',
    location: {
      '@type': 'Place',
      name: event.location,
    },
    organizer: {
      '@type': 'Organization',
      name: '카나',
      url: SITE_URL,
    },
    ...(typeof event.price === 'number'
      ? {
          offers: {
            '@type': 'Offer',
            price: event.price,
            priceCurrency: 'KRW',
            availability:
              event.confirmed_count >= event.capacity
                ? 'https://schema.org/SoldOut'
                : 'https://schema.org/InStock',
            url: `${SITE_URL}/rotation/apply?eventId=${event.id}`,
          },
        }
      : {}),
  }));
}
