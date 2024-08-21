import { createSelector, createEntityAdapter } from "@reduxjs/toolkit";
import { apiSlice } from "../../../app/api/apiSlice";

const usersAdapter = createEntityAdapter({});

const initialState = usersAdapter.getInitialState();

export const usersApiSlice = apiSlice.injectEndpoints({
	endpoints: (builder) => ({
		getUsers: builder.query({
			query: () => ({
				url: `/users`,
				// Example: we have a backend API always returns a 200,
				// but sets an `isError` property when there is an error.
				validateStatus: (response, result) =>
					response.status === 200 && !result.isError,
			}),
			keepUnusedDataFor: 5,
			transformResponse: (responseData: []) => {
				const loadedUsers = responseData.map((user: any) => {
					user.id = user._id;
					return user;
				});
				return usersAdapter.setAll(initialState, loadedUsers);
			},
			providesTags: (result) => {
				if (result?.ids) {
					return [
						{ type: "User" as const, id: "LIST" }, // Assert type as "User"
						...result.ids.map((id) => ({ type: "User" as const, id })),
					];
				} else return [{ type: "User" as const, id: "LIST" }];
			},
		}),
	}),
});

export const { useGetUsersQuery } = usersApiSlice;

// returns the query result object
export const selectUsersResult = usersApiSlice.endpoints.getUsers.select(1);

// creates memoized selector
const selectUsersData = createSelector(
	selectUsersResult,
	(usersResult) => usersResult.data // normalized state object with ids & entities
);

//getSelectors creates these selectors and we rename them with aliases using destructuring
export const {
	selectAll: selectAllUsers,
	selectById: selectUserById,
	selectIds: selectUserIds,
} = usersAdapter.getSelectors(
	(state: any) => selectUsersData(state) ?? initialState
);
