import { renderHook, act } from '@testing-library/react-native';
import { useCountdown } from './use-countdown';

beforeEach(() => {
  jest.useFakeTimers();
});

afterEach(() => {
  jest.useRealTimers();
});

describe('useCountdown', () => {
  it('starts with the initial value', () => {
    const { result } = renderHook(() => useCountdown(10));
    expect(result.current.timeLeft).toBe(10);
    expect(result.current.isExpired).toBe(false);
  });

  it('decrements every second', () => {
    const { result } = renderHook(() => useCountdown(5));

    act(() => jest.advanceTimersByTime(1000));
    expect(result.current.timeLeft).toBe(4);

    act(() => jest.advanceTimersByTime(1000));
    expect(result.current.timeLeft).toBe(3);
  });

  it('stops at 0 and sets isExpired to true', () => {
    const { result } = renderHook(() => useCountdown(2));

    act(() => jest.advanceTimersByTime(2000));
    expect(result.current.timeLeft).toBe(0);
    expect(result.current.isExpired).toBe(true);

    // Should not go negative
    act(() => jest.advanceTimersByTime(1000));
    expect(result.current.timeLeft).toBe(0);
  });

  it('does not start when autoStart is false', () => {
    const { result } = renderHook(() => useCountdown(10, { autoStart: false }));
    expect(result.current.timeLeft).toBe(10);

    act(() => jest.advanceTimersByTime(3000));
    expect(result.current.timeLeft).toBe(10);
  });

  it('does not start when initial seconds is 0', () => {
    const { result } = renderHook(() => useCountdown(0));
    expect(result.current.timeLeft).toBe(0);
    expect(result.current.isExpired).toBe(true);

    act(() => jest.advanceTimersByTime(2000));
    expect(result.current.timeLeft).toBe(0);
  });

  it('restart resets and starts counting down', () => {
    const { result } = renderHook(() => useCountdown(3));

    act(() => jest.advanceTimersByTime(3000));
    expect(result.current.isExpired).toBe(true);

    act(() => result.current.restart(5));
    expect(result.current.timeLeft).toBe(5);
    expect(result.current.isExpired).toBe(false);

    act(() => jest.advanceTimersByTime(2000));
    expect(result.current.timeLeft).toBe(3);
  });

  it('restart with 0 does not start', () => {
    const { result } = renderHook(() => useCountdown(5));

    act(() => result.current.restart(0));
    expect(result.current.timeLeft).toBe(0);
    expect(result.current.isExpired).toBe(true);
  });

  it('cleans up interval on unmount', () => {
    const clearIntervalSpy = jest.spyOn(global, 'clearInterval');
    const { unmount } = renderHook(() => useCountdown(10));

    unmount();
    expect(clearIntervalSpy).toHaveBeenCalled();
    clearIntervalSpy.mockRestore();
  });
});
