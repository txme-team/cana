# Gateway path ownership

`txme-cana`와 기존 `cana`는 소스를 합치지 않고 별도로 배포한다. 사용자에게는 `cana.im` 하나로 보이며, Lightsail의 프록시가 앞단 게이트웨이 역할을 한다.

## txme-cana가 소유하는 경로

- `/`: 공개 랜딩 페이지
- `/rotation/**`: 로테이션 화면
- `/api/rotation/**`: 로테이션 API
- `/txme-assets/**`: 랜딩과 로테이션이 사용하는 정적 자산
- Next.js가 자체 생성하는 `/_next/**`

Lightsail 프록시는 위 경로만 `txme-cana`의 고정 Vercel 도메인으로 전달한다. 그 밖의 경로는 같은 Lightsail Container Service 안의 기존 Cana 컨테이너로 전달한다. 프록시는 내부 전달만 하므로 사용자 브라우저의 주소는 계속 `cana.im`이다.

`/icon.*`, `/robots.txt`, `/sitemap.xml`, `/manifest.webmanifest`, `/sw.js` 같은 루트 공개 파일은 기존 Cana가 단독 소유한다. Rotation 아이콘은 `/txme-assets/app-icon.*`를 사용하고, Rotation 검색 노출 규칙은 Cana의 robots/sitemap에 합친다.

## 새 코드 추가 규칙

- 새 로테이션 화면은 `app/rotation` 아래에 만든다.
- 새 로테이션 API는 `app/api/rotation` 아래에 만든다.
- 새 정적 자산은 `public/txme-assets` 아래에 두고 `/txme-assets/...`로 참조한다.
- 기존 Cana 화면/API는 `txme-cana`에 만들지 않고 기존 `cana` 저장소에 추가한다.
- `app/icon.*`, `app/robots.ts`, `app/sitemap.ts`는 만들지 않는다.
- PR/배포 전 `npm run check:gateway`를 실행한다.

## Vercel Cron

이 프로젝트는 Vercel Hobby 플랜이므로 `vercel.json`에 시간당 Cron을 등록하지 않고 기존 `cron-job.org` 스케줄러를 사용한다. Production 배포 후 외부 스케줄러의 호출 경로를 다음과 같이 확인한다.

- URL: `https://cana-for-love.vercel.app/api/rotation/cron/sms-scheduler`
- Method: `GET`
- Schedule: 매시간 정각
- Header: `Authorization: Bearer <CRON_SECRET>`

Vercel Production의 `CRON_SECRET`과 cron-job.org의 Authorization 헤더가 같아야 한다.

Vercel Preview URL은 배포마다 바뀔 수 있으므로 Lightsail 프록시에는 Production의 고정 프로젝트 도메인을 설정한다.

Vercel Production 도메인에서 랜딩을 직접 확인할 때 `/home`, `/terms`, `/privacy`는 `cana.im`의 기존 Cana 화면으로 리다이렉트한다. 전체 fallback rewrite는 사용하지 않는다. 전체 fallback은 존재하지 않는 `/rotation/**` 요청을 Lightsail에서 다시 Vercel로 보내 순환시킬 수 있다.
