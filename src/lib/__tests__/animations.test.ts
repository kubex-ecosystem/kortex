import {
    fadeIn,
    fadeInUp,
    hoverLift,
    hoverScale,
    scaleIn,
    slideInLeft,
    slideInRight,
    staggerContainer
} from '../animations';

describe('Animation Variants', () => {
  describe('fadeInUp animation', () => {
    it('has correct initial state', () => {
      expect(fadeInUp.initial).toEqual({
        opacity: 0,
        y: 60,
      });
    });

    it('has correct animate state', () => {
      expect(fadeInUp.animate).toHaveProperty('opacity', 1);
      expect(fadeInUp.animate).toHaveProperty('y', 0);
      expect(fadeInUp.animate).toHaveProperty('transition');
    });

    it('has correct transition timing', () => {
      const transition = (fadeInUp.animate as any).transition;
      expect(transition.duration).toBe(0.6);
      expect(transition.ease).toEqual([0.6, -0.05, 0.01, 0.99]);
    });
  });

  describe('fadeIn animation', () => {
    it('has correct initial state', () => {
      expect(fadeIn.initial).toEqual({
        opacity: 0,
      });
    });

    it('has correct animate state', () => {
      expect(fadeIn.animate).toHaveProperty('opacity', 1);
      expect(fadeIn.animate).toHaveProperty('transition');
    });

    it('has correct transition duration', () => {
      const transition = (fadeIn.animate as any).transition;
      expect(transition.duration).toBe(0.6);
    });
  });

  describe('staggerContainer animation', () => {
    it('has empty initial state', () => {
      expect(staggerContainer.initial).toEqual({});
    });

    it('has stagger transition', () => {
      const transition = (staggerContainer.animate as any).transition;
      expect(transition.staggerChildren).toBe(0.1);
    });
  });

  describe('slideInLeft animation', () => {
    it('has correct initial state', () => {
      expect(slideInLeft.initial).toEqual({
        opacity: 0,
        x: -60,
      });
    });

    it('has correct animate state', () => {
      expect(slideInLeft.animate).toHaveProperty('opacity', 1);
      expect(slideInLeft.animate).toHaveProperty('x', 0);
      expect(slideInLeft.animate).toHaveProperty('transition');
    });

    it('has correct transition timing', () => {
      const transition = (slideInLeft.animate as any).transition;
      expect(transition.duration).toBe(0.6);
      expect(transition.ease).toEqual([0.6, -0.05, 0.01, 0.99]);
    });
  });

  describe('slideInRight animation', () => {
    it('has correct initial state', () => {
      expect(slideInRight.initial).toEqual({
        opacity: 0,
        x: 60,
      });
    });

    it('has correct animate state', () => {
      expect(slideInRight.animate).toHaveProperty('opacity', 1);
      expect(slideInRight.animate).toHaveProperty('x', 0);
      expect(slideInRight.animate).toHaveProperty('transition');
    });

    it('has correct transition timing', () => {
      const transition = (slideInRight.animate as any).transition;
      expect(transition.duration).toBe(0.6);
      expect(transition.ease).toEqual([0.6, -0.05, 0.01, 0.99]);
    });
  });

  describe('scaleIn animation', () => {
    it('has correct initial state', () => {
      expect(scaleIn.initial).toEqual({
        opacity: 0,
        scale: 0.8,
      });
    });

    it('has correct animate state', () => {
      expect(scaleIn.animate).toHaveProperty('opacity', 1);
      expect(scaleIn.animate).toHaveProperty('scale', 1);
      expect(scaleIn.animate).toHaveProperty('transition');
    });

    it('has correct transition timing', () => {
      const transition = (scaleIn.animate as any).transition;
      expect(transition.duration).toBe(0.6);
      expect(transition.ease).toEqual([0.6, -0.05, 0.01, 0.99]);
    });
  });

  describe('hoverScale animation', () => {
    it('has correct whileHover state', () => {
      expect(hoverScale.whileHover).toHaveProperty('scale', 1.05);
      expect(hoverScale.whileHover).toHaveProperty('transition');
    });

    it('has correct hover transition', () => {
      const transition = hoverScale.whileHover.transition;
      expect(transition.duration).toBe(0.2);
    });

    it('has correct whileTap state', () => {
      expect(hoverScale.whileTap).toEqual({
        scale: 0.95,
      });
    });
  });

  describe('hoverLift animation', () => {
    it('has correct whileHover state', () => {
      expect(hoverLift.whileHover).toHaveProperty('y', -8);
      expect(hoverLift.whileHover).toHaveProperty('transition');
    });

    it('has correct hover transition', () => {
      const transition = hoverLift.whileHover.transition;
      expect(transition.duration).toBe(0.2);
    });
  });

  describe('Animation consistency', () => {
    it('fade animations use consistent timing', () => {
      const fadeInDuration = (fadeIn.animate as any).transition.duration;
      const fadeInUpDuration = (fadeInUp.animate as any).transition.duration;
      
      expect(fadeInDuration).toBe(fadeInUpDuration);
      expect(fadeInDuration).toBe(0.6);
    });

    it('slide animations use consistent easing', () => {
      const leftEase = (slideInLeft.animate as any).transition.ease;
      const rightEase = (slideInRight.animate as any).transition.ease;
      const upEase = (fadeInUp.animate as any).transition.ease;
      
      expect(leftEase).toEqual(rightEase);
      expect(leftEase).toEqual(upEase);
    });

    it('hover animations use consistent timing', () => {
      const scaleDuration = hoverScale.whileHover.transition.duration;
      const liftDuration = hoverLift.whileHover.transition.duration;
      
      expect(scaleDuration).toBe(liftDuration);
      expect(scaleDuration).toBe(0.2);
    });

    it('all main animations have initial and animate states', () => {
      const animations = [fadeInUp, fadeIn, slideInLeft, slideInRight, scaleIn];
      
      animations.forEach(animation => {
        expect(animation).toHaveProperty('initial');
        expect(animation).toHaveProperty('animate');
      });
    });

    it('all slide animations have consistent displacement', () => {
      const leftX = (slideInLeft.initial as any).x;
      const rightX = (slideInRight.initial as any).x;
      const upY = (fadeInUp.initial as any).y;
      
      expect(Math.abs(leftX)).toBe(60);
      expect(Math.abs(rightX)).toBe(60);
      expect(Math.abs(upY)).toBe(60);
    });
  });

  describe('Type safety', () => {
    it('exports are defined and have correct types', () => {
      expect(fadeInUp).toBeDefined();
      expect(fadeIn).toBeDefined();
      expect(staggerContainer).toBeDefined();
      expect(slideInLeft).toBeDefined();
      expect(slideInRight).toBeDefined();
      expect(scaleIn).toBeDefined();
      expect(hoverScale).toBeDefined();
      expect(hoverLift).toBeDefined();
    });

    it('animation variants have proper structure', () => {
      const mainAnimations = [fadeInUp, fadeIn, slideInLeft, slideInRight, scaleIn];
      
      mainAnimations.forEach(animation => {
        expect(typeof animation.initial).toBe('object');
        expect(typeof animation.animate).toBe('object');
      });
    });

    it('hover animations have proper structure', () => {
      expect(typeof hoverScale.whileHover).toBe('object');
      expect(typeof hoverScale.whileTap).toBe('object');
      expect(typeof hoverLift.whileHover).toBe('object');
    });
  });
});
