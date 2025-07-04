(function () {
  // VARIABLE
  let elGNBBtn = document.querySelector(".c-gnb-btn");
  let elGNB = document.querySelector(".c-gnb");
  let userId = "";

  document.addEventListener("DOMContentLoaded", () => {
    initialize();
  });

  function initialize() {
    setUserID();
    
    if (typeof hljs !== "undefined") {
      hljs.highlightAll();
    }

    elGNBBtn.addEventListener("click", function () {
      elGNB.classList.toggle("active");
    });

    const tracker = new ElementDwellTimeTracker({
      minVisibleHeight: 200,
      minVisibleRatio: 0.2,
    });
    const elementsToTrack = document.querySelectorAll("[data-track-id]");
    elementsToTrack.forEach((el) => tracker.track(el));
  }

  function setUserID() {
    const userIdKey = "dwell_time_user_id";
    userId = localStorage.getItem(userIdKey);

    if (!userId) {
      userId = self.crypto.randomUUID();
      localStorage.setItem(userIdKey, userId);
    }
  }

  class ElementDwellTimeTracker {
    constructor(options) {
      this.observer = null;
      this.elementData = new Map();
      this.options = options;
      this.threshold = [];
      this.init();
    }

    init() {
      const numSteps = 100; // 호출 횟수
      for (let i = 1; i <= numSteps; i++) {
        this.threshold.push(i / numSteps);
      }

      const callback = (entries) => {
        entries.forEach((entry) => {
          console.log(
            `Element '${entry.target.dataset.trackId}' visibility:`,
            `${Math.round(entry.intersectionRatio * 100)}%`
          );

          const elementId = entry.target.dataset.trackId;
          if (!elementId) return;

          const data = this.elementData.get(elementId);
          if (!data) return;

          const visibleHeight = entry.intersectionRect.height;
          const viewportHeight = entry.rootBounds.height;

          // 새로운 노출 기준: 최소 높이와 최소 뷰포트 비율을 모두 만족하는가?
          const isSufficientlyVisible =
            visibleHeight >= this.options.minVisibleHeight ||
            visibleHeight / viewportHeight >= this.options.minVisibleRatio;

          if (isSufficientlyVisible) {
            // 요소가 '유효하게' 뷰포트에 진입
            if (data.entryTime === null) {
              data.entryTime = Date.now();
              this.elementData.set(elementId, data);
              console.log(
                ` Element '${elementId}' entered viewport sufficiently.`
              );
            }
          } else {
            // 요소가 뷰포트에서 이탈했거나 '유효한 노출'이 아님
            if (data.entryTime !== null) {
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

      const observerOptions = {
        root: this.options.root || null,
        rootMargin: this.options.rootMargin || "0px",
        threshold: this.threshold,
      };

      this.observer = new IntersectionObserver(callback, observerOptions);

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
          //   if (data.entryTime !== null) {
          // const exitTime = Date.now();
          // const dwellTime = exitTime - data.entryTime;
          // data.totalDwellTime += dwellTime;
          // 이 시점에서 최종 누적 시간을 서버로 전송할 수 있습니다.
          console.log(
            ` Finalizing for '${elementId}' on unload. Total: ${data.totalDwellTime}ms`
          );
          this.sendData(elementId, data.totalDwellTime, userId);
          //   }
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

    sendData(elementId, totalDwellTime, userId) {
      window.dataLayer.push({
        event: "element_dwell_time", // GTM에서 사용할 커스텀 이벤트 이름
        element_id: elementId,
        dwell_time_seconds: Math.round(totalDwellTime / 1000),
        dwell_time_user_id: userId,
      });
    }
  }
})();
