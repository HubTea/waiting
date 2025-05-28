import retry from 'retry-as-promised';

/**
 * 
 * @param callback 반복 호출할 함수 또는 async 함수
 * 
 */
export async function retryImmediate(callback: () => unknown) {
    await retry(callback, {
        max: 5,
        backoffBase: 0,
    });
}
