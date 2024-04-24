/**
 * defineOk({ code:"xxx", msg:"xxx", data:"xxx" })
 * @param param
 * @returns 
 */
export const defineOk = <T>({ code = 200, msg = 'ok', data }: MResponse<T>) => {
    return {
        code,
        msg,
        data
    };
}

/**
 * defineError({ code:"xxx", msg:"xxx" })
 * @param param
 * @returns 
 */
export const defineError = <T>({ code = 500, msg = '', data }: MResponse<T>) => {
    return {
        code,
        msg,
        data
    };
}