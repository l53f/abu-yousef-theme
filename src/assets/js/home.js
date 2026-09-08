import "lite-youtube-embed";
import BasePage from "./base-page";
import Lightbox from "fslightbox";
window.fslightbox = Lightbox;

class Home extends BasePage {
    onReady() {
        // الهيدر الشفاف: يُفعّل من JS لا من Twig، فالصفحة الرئيسية وحدها
        // هي ما يُشغّل هذا الملف (انظر initiateWhenReady في آخر الملف)
        document.body.classList.add('ay-home');

        this.initFeaturedTabs();
        this.initFaqAccordion();
        this.initScrollReveal();
    }

    /**
     * used in views/components/home/featured-products-style*.twig
     */
    initFeaturedTabs() {
        app.all('.tab-trigger', el => {
            el.addEventListener('click', ({ currentTarget: btn }) => {
                let id = btn.dataset.componentId;
                // btn.setAttribute('fill', 'solid');
                app.toggleClassIf(`#${id} .tabs-wrapper>div`, 'is-active opacity-0 translate-y-3', 'inactive', tab => tab.id == btn.dataset.target)
                    .toggleClassIf(`#${id} .tab-trigger`, 'is-active', 'inactive', tabBtn => tabBtn == btn);

                // fadeIn active tabe
                setTimeout(() => app.toggleClassIf(`#${id} .tabs-wrapper>div`, 'opacity-100 translate-y-0', 'opacity-0 translate-y-3', tab => tab.id == btn.dataset.target), 100);
            })
        });
        document.querySelectorAll('.s-block-tabs').forEach(block => block.classList.add('tabs-initialized'));
    }

    /**
     * used in views/components/home/faq.twig
     * أكورديون الأسئلة الشائعة — يفتح سؤالاً واحداً داخل كل قسم
     */
    initFaqAccordion() {
        document.querySelectorAll('.ay-faq').forEach(section => {
            const items = section.querySelectorAll('.ay-faq__item');

            items.forEach(item => {
                const btn = item.querySelector('.ay-faq__btn');
                const content = item.querySelector('.ay-faq__content');
                if (!btn || !content) return;

                content.style.height = '0px';

                btn.addEventListener('click', () => {
                    const isOpen = item.classList.contains('is-open');

                    // أغلق البقية داخل هذا القسم فقط
                    items.forEach(other => {
                        if (other === item) return;
                        const otherContent = other.querySelector('.ay-faq__content');
                        const otherBtn = other.querySelector('.ay-faq__btn');
                        other.classList.remove('is-open');
                        if (otherBtn) otherBtn.setAttribute('aria-expanded', 'false');
                        if (otherContent) otherContent.style.height = '0px';
                    });

                    item.classList.toggle('is-open', !isOpen);
                    btn.setAttribute('aria-expanded', String(!isOpen));
                    content.style.height = isOpen ? '0px' : `${content.scrollHeight}px`;
                });
            });
        });
    }

    /**
     * ظهور تدريجي لعناصر الأقسام عند التمرير — يحاكي s-block--animate
     * يحترم تفضيل تقليل الحركة، ويعرض كل شيء فوراً إن لم يدعم المتصفح IntersectionObserver
     */
    initScrollReveal() {
        const sections = document.querySelectorAll('.ay-animate');
        if (!sections.length) return;

        const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        if (reduceMotion || !('IntersectionObserver' in window)) {
            sections.forEach(s => s.classList.add('is-revealed'));
            return;
        }

        const observer = new IntersectionObserver((entries, obs) => {
            entries.forEach(entry => {
                if (!entry.isIntersecting) return;

                const section = entry.target;
                section.querySelectorAll('.ay-anime-item').forEach((el, i) => {
                    el.style.transitionDelay = `${Math.min(i * 90, 540)}ms`;
                });
                section.classList.add('is-revealed');
                obs.unobserve(section);
            });
        }, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });

        sections.forEach(section => observer.observe(section));
    }
}

Home.initiateWhenReady(['index']);
