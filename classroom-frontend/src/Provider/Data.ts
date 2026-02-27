import dataProviderRest from "@refinedev/simple-rest";

const API_URL = import.meta.env.VITE_BACKEND_BASE_URL;
const buildHttpError = async (response: Response): Promise<HttpError> => {
  let message = 'Request failed.';

  try {
    const payload = (await response.json()) as { message?: string }

    if (payload?.message) message = payload.message;
  } catch {
    // Ignore errors
  }

  return {
    message,
    statusCode: response.status
  }
}

const dataProviderOptions = {
    getList: {
        getEndpoint: ({ resource }: { resource: string }) => resource,
        
        // Video Logic: URL ke parameters (filters/pagination) build karna
        buildQueryParams: async ({ resource, pagination, filters }: any) => {
            const page = pagination?.current ?? 1;
            const pageSize = pagination?.pageSize ?? 10;
            
            const params: Record<string, string | number> = {
                page,
                limit: pageSize,
            };

            // Filters handling (Department aur Search ke liye)
            filters?.forEach((filter: any) => {
                const field = 'field' in filter ? filter.field : '';
                const value = String(filter.value);

                if (resource === 'subjects') {
                    if (field === 'department') params.department = value;
                    if (field === 'name' || field === 'code') params.search = value;
                }
            });

            return params;
        },

        mapResponse: async (response: Response) => {
            if (!response.ok) throw await buildHttpError(response);
            const payload = await response.json();
            // Data return logic
            return payload.data ?? payload ?? [];
        },
        
        getTotalCount: async (response: Response) => {
            const payload = await response.json();
            return payload.pagination?.total ?? payload.total ?? (payload.data?.length || 0);
        },
    },
    getOne: {
        getEndpoint: ({ resource, id }: { resource: string; id: string }) => `${resource}/${id}`,
        mapResponse: async (response: Response) => {
            const payload = await response.json();
            return payload.data ?? payload;
        },
    },
};

// Final Export (TypeScript error se bachne ke liye initialization)
export const dataProvider = dataProviderRest(API_URL);

// Provider options ko merge karna taake custom logic active ho jaye
Object.assign(dataProvider, dataProviderOptions);