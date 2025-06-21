(function () {
  // VARIABLE
  let elGNBBtn = document.querySelector(".c-gnb-btn");
  let elGNB = document.querySelector(".c-gnb");

  document.addEventListener("DOMContentLoaded", () => {
    initialize();
  });

  function initialize() {
    if (typeof hljs !== "undefined") {
      hljs.highlightAll();
    }

    elGNBBtn.addEventListener("click", function () {
      elGNB.classList.toggle("active");
    });

    const tracker = new ElementDwellTimeTracker({ threshold: 0.5 }); // 50% 이상 보일 때
    const elementsToTrack = document.querySelectorAll("[data-track-id]");
    elementsToTrack.forEach((el) => tracker.track(el));
  }

  class ElementDwellTimeTracker {
    constructor(options = { threshold: 0.5 }) {
      this.observer = null;
      this.elementData = new Map(); // 각 요소의 데이터를 저장 (entryTime, totalDwellTime)
      this.options = options;
      this.init();
    }

    init() {
      const callback = (entries) => {
        entries.forEach((entry) => {
          const elementId = entry.target.dataset.trackId;
          if (!elementId) return;

          const data = this.elementData.get(elementId);
          if (!data) return;

          if (entry.isIntersecting) {
            // 요소가 뷰포트에 진입
            if (data.entryTime === null) {
              // 타이머가 꺼져있을 때만 시작
              data.entryTime = Date.now();
              this.elementData.set(elementId, data);
              console.log(` Element '${elementId}' entered viewport.`);
            }
          } else {
            // 요소가 뷰포트에서 이탈
            if (data.entryTime !== null) {
              // 타이머가 켜져있을 때만 중지 및 계산
              const exitTime = Date.now();
              const dwellTime = exitTime - data.entryTime;
              data.totalDwellTime += dwellTime;
              data.entryTime = null; // 타이머 리셋
              this.elementData.set(elementId, data);
              console.log(
                ` Element '${elementId}' exited. Dwell: ${dwellTime}ms, Total: ${data.totalDwellTime}ms`
              );
            }
          }
        });
      };

      this.observer = new IntersectionObserver(callback, this.options);

      // Page Visibility API 이벤트 리스너 추가
      document.addEventListener("visibilitychange", () => {
        if (document.hidden) {
          // 페이지가 숨겨지면, 현재 활성화된 모든 타이머를 일시 중지
          this.elementData.forEach((data, elementId) => {
            if (data.entryTime !== null) {
              const exitTime = Date.now();
              const dwellTime = exitTime - data.entryTime;
              data.totalDwellTime += dwellTime;
              data.entryTime = null; // 타이머를 멈추지만, '숨김' 상태임을 표시하기 위해 별도 플래그 사용 가능
              data.pausedByVisibility = true; // 페이지 숨김으로 인한 일시정지 상태 표시
              this.elementData.set(elementId, data);
              console.log(` Page hidden. Pausing timer for '${elementId}'.`);
            }
          });
        } else {
          // 페이지가 다시 보이게 되면, 일시 중지된 타이머를 재개
          this.elementData.forEach((data, elementId) => {
            // 요소가 여전히 뷰포트 안에 있고, 페이지 숨김으로 인해 일시정지된 경우
            const element = document.querySelector(
              `[data-track-id="${elementId}"]`
            );
            if (element && data.pausedByVisibility) {
              // isIntersecting 상태를 다시 확인해야 하지만, 간단한 재개를 위해 바로 시작
              data.entryTime = Date.now();
              data.pausedByVisibility = false;
              this.elementData.set(elementId, data);
              console.log(` Page visible. Resuming timer for '${elementId}'.`);
            }
          });
        }
      });

      // 페이지 이탈 시 마지막 체류 시간 기록
      window.addEventListener("beforeunload", () => {
        this.elementData.forEach((data, elementId) => {
          if (data.entryTime !== null) {
            const exitTime = Date.now();
            const dwellTime = exitTime - data.entryTime;
            data.totalDwellTime += dwellTime;
            // 이 시점에서 최종 누적 시간을 서버로 전송할 수 있습니다.
            console.log(
              ` Finalizing for '${elementId}' on unload. Total: ${data.totalDwellTime}ms`
            );
            this.sendData(elementId, data.totalDwellTime);
          }
        });
      });
    }

    track(element) {
      const elementId = element.dataset.trackId;
      if (!elementId) {
        console.error(
          "Element to be tracked must have a 'data-track-id' attribute."
        );
        return;
      }
      this.elementData.set(elementId, { entryTime: null, totalDwellTime: 0 });
      this.observer.observe(element);
    }

    sendData(elementId, totalDwellTime, pageVariant, threshold) {
      window.dataLayer.push({
        event: "element_dwell_time", // GTM에서 사용할 커스텀 이벤트 이름
        element_id: elementId,
        dwell_time_seconds: Math.round(totalDwellTime / 1000),
        page_variant: pageVariant, // A/B 테스트 변형 식별자
        visibility_threshold: threshold, // 사용된 가시성 임계값
      });
    }

    // 데이터 전송 로직 (예시)
    sendData(elementId, totalDwellTime) {
      console.log(
        `Sending data to server: { elementId: '${elementId}', dwellTime: ${Math.round(
          totalDwellTime / 1000
        )}s }`
      );
      // 여기에 실제 서버 전송 로직(fetch, axios 등)을 구현합니다.
      // 예를 들어, Google Tag Manager의 dataLayer로 푸시할 수 있습니다.
      // window.dataLayer.push({ event: 'element_dwell_time',... });
    }
  }
})();
