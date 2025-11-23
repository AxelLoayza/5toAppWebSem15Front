export interface Category {
    id: number;
    nombre: string;
    descripcion?: string;
}

export interface Product {
    id: number;
    nombre: string;
    precio: number;
    descripcion?: string;
    category?: Category;
    createdAt?: Date;
    updatedAt?: Date;
}

export interface ApiResponse<T> {
    success: boolean;
    message: string;
    data: T;
}