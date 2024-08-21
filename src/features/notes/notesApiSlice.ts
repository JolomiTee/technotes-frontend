import { createSelector, createEntityAdapter } from "@reduxjs/toolkit";
import { apiSlice } from "../../../app/api/apiSlice";

const notesAdapter = createEntityAdapter({});

const initialState = notesAdapter.getInitialState();

export const notesApiSlice = apiSlice.injectEndpoints({
	endpoints: (builder) => ({
		getNotes: builder.query({
			query: () => ({
				url: `/notes`,
				// Example: we have a backend API always returns a 200,
				// but sets an `isError` property when there is an error.
				validateStatus: (response, result) =>
					response.status === 200 && !result.isError,
			}),
			keepUnusedDataFor: 5,
			transformResponse: (responseData: []) => {
				const loadedNotes = responseData.map((note: any) => {
					note.id = note._id;
					return note;
				});
				return notesAdapter.setAll(initialState, loadedNotes);
			},
			providesTags: (result) => {
				if (result?.ids) {
					return [
						{ type: "Note" as const, id: "LIST" }, // Assert type as "Note"
						...result.ids.map((id) => ({ type: "Note" as const, id })),
					];
				} else return [{ type: "Note" as const, id: "LIST" }];
			},
		}),
	}),
});

export const { useGetNotesQuery } = notesApiSlice;

// returns the query result object
export const selectNotesResult = notesApiSlice.endpoints.getNotes.select(1);

// creates memoized selector
const selectNotesData = createSelector(
	selectNotesResult,
	(notesResult) => notesResult.data // normalized state object with ids & entities
);

//getSelectors creates these selectors and we rename them with aliases using destructuring
export const {
	selectAll: selectAllNotes,
	selectById: selectNoteById,
	selectIds: selectNoteIds,
} = notesAdapter.getSelectors(
	(state: any) => selectNotesData(state) ?? initialState
);
